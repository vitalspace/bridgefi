;; lending-system-v7.clar
;; Lending system with collateral in STX - RESPECTS USER SELECTED AMOUNT

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-active (err u102))
(define-constant err-insufficient-collateral (err u103))
(define-constant err-invalid-score (err u104))
(define-constant err-payment-not-due (err u105))
(define-constant err-payment-overdue (err u106))
(define-constant err-insufficient-payment (err u107))
(define-constant err-loan-completed (err u108))
(define-constant err-invalid-term (err u109))
(define-constant err-insufficient-balance (err u110))
(define-constant err-invalid-amount (err u111))

;; System configuration
(define-constant fee-percentage u10)
(define-constant collateral-ratio u150)
(define-constant payment-period u4320)
(define-constant grace-period u432)

;; Validation bounds
(define-constant min-score u300)
(define-constant max-score u850)
(define-constant min-term u1)
(define-constant max-term u36)

;; Loan amounts per score (in microSTX)
(define-constant low-score-amount u10000000)
(define-constant medium-score-amount u25000000)
(define-constant high-score-amount u50000000)

;; Data structures
(define-map loans
  principal
  {
    amount: uint,
    collateral: uint,
    fee: uint,
    total-debt: uint,
    monthly-payment: uint,
    payments-made: uint,
    total-payments: uint,
    last-payment-block: uint,
    start-block: uint,
    score-level: (string-ascii 10),
    is-active: bool,
    is-defaulted: bool,
    loan-withdrawn: bool
  }
)

(define-map user-scores
  principal
  {
    score: uint,
    score-level: (string-ascii 10),
    last-updated: uint
  }
)

(define-data-var total-loans-issued uint u0)
(define-data-var total-fees-collected uint u0)

;; Admin functions
(define-public (update-user-score (user principal) (score uint))
  (begin
    ;; #[filter(user, score)]
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= score min-score) err-invalid-score)
    (asserts! (<= score max-score) err-invalid-score)
    
    (let
      (
        (score-level (calculate-score-level score))
      )
      (ok (map-set user-scores user {
        score: score,
        score-level: score-level,
        last-updated: burn-block-height
      }))
    )
  )
)

;; Helper function to determine score level
(define-private (calculate-score-level (score uint))
  (if (>= score u700)
    "high"
    (if (>= score u500)
      "medium"
      "low"
    )
  )
)

;; Function to calculate max loan amount based on score
(define-read-only (get-max-loan-for-score (score-level (string-ascii 10)))
  (if (is-eq score-level "high")
    high-score-amount
    (if (is-eq score-level "medium")
      medium-score-amount
      low-score-amount
    )
  )
)

;; FIXED: Request loan - User specifies EXACT loan amount they want
(define-public (request-loan (user-score uint) (requested-amount uint) (term-months uint))
  (begin
    ;; VALIDATION FIRST - Check score is in valid range
    ;; #[filter(user-score, requested-amount, term-months)]
    (asserts! (>= user-score min-score) err-invalid-score)
    (asserts! (<= user-score max-score) err-invalid-score)
    (asserts! (>= term-months min-term) err-invalid-term)
    (asserts! (<= term-months max-term) err-invalid-term)
    
    (let
      (
        (score-level (calculate-score-level user-score))
        (max-loan (get-max-loan-for-score score-level))
        (loan-amount requested-amount)
        (fee (/ (* loan-amount fee-percentage) u100))
        (total-debt (+ loan-amount fee))
        (monthly-payment (/ total-debt term-months))
        (required-collateral (/ (* loan-amount collateral-ratio) u100))
        (existing-loan (map-get? loans tx-sender))
      )
      
      ;; Verify requested amount does not exceed max for this score
      (asserts! (<= loan-amount max-loan) err-invalid-amount)
      
      ;; Verify requested amount is greater than 0
      (asserts! (> loan-amount u0) err-invalid-amount)
      
      ;; Verify no active loan
      (asserts! 
        (or 
          (is-none existing-loan)
          (is-eq (get is-active (unwrap-panic existing-loan)) false)
        )
        err-already-active
      )
      
      ;; Check if contract has enough liquidity
      (asserts! (>= (stx-get-balance (as-contract tx-sender)) loan-amount) err-insufficient-balance)
      
      ;; Transfer collateral from user to contract
      (try! (stx-transfer? required-collateral tx-sender (as-contract tx-sender)))
      
      ;; Store user's score
      (map-set user-scores tx-sender {
        score: user-score,
        score-level: score-level,
        last-updated: burn-block-height
      })
      
      ;; Create loan record (NOT withdrawn yet)
      (map-set loans tx-sender {
        amount: loan-amount,
        collateral: required-collateral,
        fee: fee,
        total-debt: total-debt,
        monthly-payment: monthly-payment,
        payments-made: u0,
        total-payments: term-months,
        last-payment-block: burn-block-height,
        start-block: burn-block-height,
        score-level: score-level,
        is-active: true,
        is-defaulted: false,
        loan-withdrawn: false
      })
      
      ;; Update stats
      (var-set total-loans-issued (+ (var-get total-loans-issued) u1))
      
      (ok {
        loan-amount: loan-amount,
        collateral: required-collateral,
        monthly-payment: monthly-payment,
        total-payments: term-months
      })
    )
  )
)

;; Withdraw loan amount (user calls after request-loan)
(define-public (withdraw-loan)
  (let
    (
      (loan-data (unwrap! (map-get? loans tx-sender) err-not-found))
      (loan-amount (get amount loan-data))
    )
    
    ;; Verify loan is active
    (asserts! (get is-active loan-data) err-loan-completed)
    
    ;; Verify not already withdrawn
    (asserts! (not (get loan-withdrawn loan-data)) err-already-active)
    
    ;; Transfer loan to user
    (try! (as-contract (stx-transfer? loan-amount tx-sender tx-sender)))
    
    ;; Mark as withdrawn
    (map-set loans tx-sender
      (merge loan-data {
        loan-withdrawn: true
      })
    )
    
    (ok loan-amount)
  )
)

;; Make monthly payment
(define-public (make-payment)
  (let
    (
      (loan-data (unwrap! (map-get? loans tx-sender) err-not-found))
      (payment-amount (get monthly-payment loan-data))
      (blocks-since-last (- burn-block-height (get last-payment-block loan-data)))
      (new-payments-made (+ (get payments-made loan-data) u1))
      (collateral-to-release (/ (get collateral loan-data) (get total-payments loan-data)))
    )
    
    ;; Verify loan is active
    (asserts! (get is-active loan-data) err-loan-completed)
    
    ;; Verify not in default
    (asserts! (not (get is-defaulted loan-data)) err-payment-overdue)
    
    ;; Verify enough time has passed
    (asserts! (>= blocks-since-last payment-period) err-payment-not-due)
    
    ;; Receive payment to contract
    (try! (stx-transfer? payment-amount tx-sender (as-contract tx-sender)))
    
    ;; Release proportional collateral
    (try! (as-contract (stx-transfer? collateral-to-release tx-sender tx-sender)))
    
    ;; Update collected fees
    (var-set total-fees-collected 
      (+ (var-get total-fees-collected) 
         (/ (* payment-amount (get fee loan-data)) (get total-debt loan-data))
      )
    )
    
    ;; Check if last payment
    (if (is-eq new-payments-made (get total-payments loan-data))
      ;; Loan completed
      (begin
        (map-set loans tx-sender 
          (merge loan-data {
            payments-made: new-payments-made,
            is-active: false,
            last-payment-block: burn-block-height
          })
        )
        (ok {completed: true, remaining: u0})
      )
      ;; Update loan
      (begin
        (map-set loans tx-sender
          (merge loan-data {
            payments-made: new-payments-made,
            last-payment-block: burn-block-height
          })
        )
        (ok {completed: false, remaining: (- (get total-payments loan-data) new-payments-made)})
      )
    )
  )
)

;; Mark as defaulted
(define-public (mark-as-defaulted (user principal))
  (begin
    ;; #[filter(user)]
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (let
      (
        (loan-data (unwrap! (map-get? loans user) err-not-found))
        (blocks-since-last (- burn-block-height (get last-payment-block loan-data)))
      )
      
      ;; Verify grace period has passed
      (asserts! (>= blocks-since-last (+ payment-period grace-period)) err-payment-not-due)
      
      ;; Mark as default
      (map-set loans user
        (merge loan-data {
          is-defaulted: true,
          is-active: false
        })
      )
      
      (ok true)
    )
  )
)

;; Read-only functions

(define-read-only (get-loan-info (user principal))
  (map-get? loans user)
)

(define-read-only (get-user-score (user principal))
  (map-get? user-scores user)
)

(define-read-only (get-next-payment-due (user principal))
  (match (map-get? loans user)
    loan-data
      (ok {
        amount: (get monthly-payment loan-data),
        due-block: (+ (get last-payment-block loan-data) payment-period),
        grace-until: (+ (get last-payment-block loan-data) payment-period grace-period),
        is-overdue: (> burn-block-height (+ (get last-payment-block loan-data) payment-period grace-period))
      })
    err-not-found
  )
)

(define-read-only (get-contract-stats)
  (ok {
    total-loans: (var-get total-loans-issued),
    total-fees: (var-get total-fees-collected)
  })
)

;; Allow owner to withdraw accumulated fees
(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    ;; #[filter(amount)]
    (asserts! (<= amount (var-get total-fees-collected)) err-insufficient-balance)

    (as-contract (stx-transfer? amount tx-sender contract-owner))
  )
)

;; Function to withdraw liquidity (only owner)
(define-public (withdraw-liquidity (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (let
      (
        (contract-balance (stx-get-balance (as-contract tx-sender)))
      )
      ;; #[filter(amount)]
      (asserts! (<= amount contract-balance) err-insufficient-balance)
      
      ;; Transfer from contract to owner
      (as-contract (stx-transfer? amount tx-sender contract-owner))
    )
  )
)

;; Function to add liquidity
(define-public (add-liquidity (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (ok amount)
  )
)

;; Function to check available liquidity
(define-read-only (get-available-liquidity)
  (stx-get-balance (as-contract tx-sender))
)

;; Function to get contract balance
(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)

;; Helper function to get contract principal
(define-read-only (get-contract-principal)
  (as-contract tx-sender)
)
