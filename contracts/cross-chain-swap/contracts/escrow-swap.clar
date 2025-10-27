;; ===================================
;; ESCROW SWAP CONTRACT - ELECTRONEUM ONLY
;; Cross-chain swap para Electroneum Testnet
;; ===================================

;; Errores
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ORDER-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-PROCESSED (err u102))
(define-constant ERR-TIMEOUT-NOT-REACHED (err u103))
(define-constant ERR-ZERO-AMOUNT (err u104))
(define-constant ERR-INVALID-STATUS (err u105))
(define-constant ERR-PAUSED (err u106))
(define-constant ERR-INVALID-CHAIN (err u107))
(define-constant ERR-INVALID-ADDRESS (err u108))
(define-constant ERR-INVALID-TOKEN (err u109))
(define-constant ERR-AMOUNT-TOO-HIGH (err u110))
(define-constant ERR-INVALID-OPERATOR (err u111))
(define-constant ERR-INVALID-TOKEN-NAME (err u112))

;; Constantes
(define-constant CONTRACT-OWNER tx-sender)
(define-constant TIMEOUT-BLOCKS u144)
(define-constant MAX-SWAP-AMOUNT u1000000000000)

;; Variables
(define-data-var backend-operator principal tx-sender)
(define-data-var order-counter uint u0)
(define-data-var contract-paused bool false)

;; Maps
(define-map supported-chains { chain: (string-ascii 30) } { enabled: bool })
(define-map supported-tokens { token: (string-ascii 20) } { enabled: bool })

(define-map swap-orders
  { order-id: uint }
  {
    user: principal,
    stx-amount: uint,
    destination-chain: (string-ascii 30),
    destination-address: (string-ascii 100),
    destination-token: (string-ascii 20),
    expected-amount: uint,
    status: (string-ascii 20),
    created-at: uint,
    completed-at: (optional uint),
    external-tx-hash: (optional (string-ascii 100))
  }
)

(define-map user-stats
  { user: principal }
  { total-swaps: uint, total-volume: uint }
)

;; ===================================
;; INICIALIZACION AUTOMATICA
;; ===================================

(define-data-var initialized bool false)

(define-private (auto-initialize)
  (if (var-get initialized)
    true
    (begin
      (var-set initialized true)
      (map-set supported-chains { chain: "electroneum-testnet" } { enabled: true })
      (map-set supported-tokens { token: "ETN" } { enabled: true })
      (map-set supported-tokens { token: "sUSDC" } { enabled: true })
      (map-set supported-tokens { token: "sUSDT" } { enabled: true })
      (map-set supported-tokens { token: "sBNB" } { enabled: true })
      (map-set supported-tokens { token: "sETH" } { enabled: true })
      true
    )
  )
)

(define-public (initialize)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (not (var-get initialized)) ERR-ALREADY-PROCESSED)
    (auto-initialize)
    (ok true)
  )
)

;; ===================================
;; READ-ONLY
;; ===================================

(define-read-only (get-order (order-id uint))
  (map-get? swap-orders { order-id: order-id })
)

(define-read-only (get-order-count)
  (var-get order-counter)
)

(define-read-only (get-backend-operator)
  (var-get backend-operator)
)

(define-read-only (is-contract-paused)
  (var-get contract-paused)
)

(define-read-only (get-user-stats (user principal))
  (default-to { total-swaps: u0, total-volume: u0 }
    (map-get? user-stats { user: user }))
)

(define-read-only (can-claim-refund (order-id uint))
  (match (get-order order-id)
    order (and 
      (is-eq (get status order) "pending")
      (>= burn-block-height (+ (get created-at order) TIMEOUT-BLOCKS)))
    false
  )
)

(define-read-only (is-chain-supported (chain (string-ascii 30)))
  (match (map-get? supported-chains { chain: chain })
    chain-data (get enabled chain-data)
    false
  )
)

(define-read-only (is-token-supported (token (string-ascii 20)))
  (match (map-get? supported-tokens { token: token })
    token-data (get enabled token-data)
    false
  )
)

;; ===================================
;; CREAR ORDEN
;; ===================================

(define-public (create-swap-order
  (stx-amount uint)
  (destination-chain (string-ascii 30))
  (destination-address (string-ascii 100))
  (destination-token (string-ascii 20))
  (expected-amount uint)
)
  (let
    (
      (order-id (+ (var-get order-counter) u1))
    )
    (asserts! (not (var-get contract-paused)) ERR-PAUSED)
    (asserts! (> stx-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (<= stx-amount MAX-SWAP-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    (asserts! (> expected-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (<= expected-amount MAX-SWAP-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    
    (auto-initialize)
    (asserts! (is-chain-supported destination-chain) ERR-INVALID-CHAIN)
    (asserts! (is-token-supported destination-token) ERR-INVALID-TOKEN)
    (asserts! (and (>= (len destination-address) u42) (<= (len destination-address) u100)) ERR-INVALID-ADDRESS)

    (try! (stx-transfer? stx-amount tx-sender (as-contract tx-sender)))

    (map-set swap-orders
      { order-id: order-id }
      {
        user: tx-sender,
        stx-amount: stx-amount,
        destination-chain: destination-chain,
        destination-address: destination-address,
        destination-token: destination-token,
        expected-amount: expected-amount,
        status: "pending",
        created-at: burn-block-height,
        completed-at: none,
        external-tx-hash: none
      }
    )

    (var-set order-counter order-id)
    (map-set user-stats
      { user: tx-sender }
      (let ((stats (get-user-stats tx-sender)))
        {
          total-swaps: (+ (get total-swaps stats) u1),
          total-volume: (+ (get total-volume stats) stx-amount)
        }
      )
    )

    (print {
      event: "swap-order-created",
      order-id: order-id,
      user: tx-sender,
      stx-amount: stx-amount,
      destination-chain: destination-chain,
      destination-address: destination-address,
      destination-token: destination-token,
      expected-amount: expected-amount,
      block-height: burn-block-height
    })

    (ok order-id)
  )
)

;; ===================================
;; CONFIRMAR SWAP
;; ===================================

(define-public (confirm-swap-sent
  (order-id uint)
  (external-tx-hash (string-ascii 100))
)
  (let
    (
      (order (unwrap! (map-get? swap-orders { order-id: order-id }) ERR-ORDER-NOT-FOUND))
    )
    (asserts! (> order-id u0) ERR-ORDER-NOT-FOUND)
    (asserts! (<= order-id (var-get order-counter)) ERR-ORDER-NOT-FOUND)
    (asserts! (is-eq tx-sender (var-get backend-operator)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status order) "pending") ERR-ALREADY-PROCESSED)
    
    (map-set swap-orders
      { order-id: order-id }
      (merge order {
        status: "completed",
        completed-at: (some burn-block-height),
        external-tx-hash: (some external-tx-hash)
      })
    )
    
    (try! (as-contract (stx-transfer? (get stx-amount order) tx-sender (var-get backend-operator))))
    
    (print {
      event: "swap-completed",
      order-id: order-id,
      user: (get user order),
      external-tx-hash: external-tx-hash,
      stx-amount: (get stx-amount order)
    })
    
    (ok true)
  )
)

;; ===================================
;; REFUND
;; ===================================

(define-public (claim-refund (order-id uint))
  (let
    (
      (order (unwrap! (map-get? swap-orders { order-id: order-id }) ERR-ORDER-NOT-FOUND))
    )
    (asserts! (> order-id u0) ERR-ORDER-NOT-FOUND)
    (asserts! (<= order-id (var-get order-counter)) ERR-ORDER-NOT-FOUND)
    (asserts! (is-eq tx-sender (get user order)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status order) "pending") ERR-ALREADY-PROCESSED)
    (asserts! (>= burn-block-height (+ (get created-at order) TIMEOUT-BLOCKS)) ERR-TIMEOUT-NOT-REACHED)
    
    (map-set swap-orders
      { order-id: order-id }
      (merge order {
        status: "refunded",
        completed-at: (some burn-block-height)
      })
    )
    
    (try! (as-contract (stx-transfer? (get stx-amount order) tx-sender (get user order))))
    
    (print {
      event: "swap-refunded",
      order-id: order-id,
      user: tx-sender,
      stx-amount: (get stx-amount order)
    })
    
    (ok true)
  )
)

;; ===================================
;; ADMIN - CANCELAR
;; ===================================

(define-public (cancel-order-admin (order-id uint))
  (let
    (
      (order (unwrap! (map-get? swap-orders { order-id: order-id }) ERR-ORDER-NOT-FOUND))
    )
    (asserts! (> order-id u0) ERR-ORDER-NOT-FOUND)
    (asserts! (<= order-id (var-get order-counter)) ERR-ORDER-NOT-FOUND)
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status order) "pending") ERR-ALREADY-PROCESSED)
    
    (map-set swap-orders
      { order-id: order-id }
      (merge order {
        status: "cancelled",
        completed-at: (some burn-block-height)
      })
    )
    
    (try! (as-contract (stx-transfer? (get stx-amount order) tx-sender (get user order))))
    (ok true)
  )
)

;; ===================================
;; ADMIN - CONFIG
;; ===================================

(define-public (set-backend-operator (new-operator principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (not (is-eq new-operator CONTRACT-OWNER)) ERR-INVALID-OPERATOR)
    (var-set backend-operator new-operator)
    (ok true)
  )
)

(define-public (pause-contract (paused bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set contract-paused paused)
    (ok true)
  )
)

(define-public (emergency-withdraw (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (<= amount MAX-SWAP-AMOUNT) ERR-AMOUNT-TOO-HIGH)
    (as-contract (stx-transfer? amount tx-sender CONTRACT-OWNER))
  )
)

;; ===================================
;; ADMIN - TOKENS (CON VALIDACION)
;; ===================================

(define-public (add-token (token-name (string-ascii 20)))
  (let
    (
      (validated-token (begin
        (asserts! (> (len token-name) u0) ERR-INVALID-TOKEN-NAME)
        (asserts! (<= (len token-name) u20) ERR-INVALID-TOKEN-NAME)
        token-name))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set supported-tokens { token: validated-token } { enabled: true })
    (ok true)
  )
)

(define-public (remove-token (token-name (string-ascii 20)))
  (let
    (
      (validated-token (begin
        (asserts! (> (len token-name) u0) ERR-INVALID-TOKEN-NAME)
        (asserts! (<= (len token-name) u20) ERR-INVALID-TOKEN-NAME)
        token-name))
    )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set supported-tokens { token: validated-token } { enabled: false })
    (ok true)
  )
)
