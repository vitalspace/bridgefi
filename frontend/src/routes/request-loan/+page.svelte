<script lang="ts">
	import Guardian from '$lib/components/ui/Guardian.svelte';
	import { walletStore } from '$lib/services/walletService';

	// Estado del préstamo
	let creditScore = $state<number | null>(null);
	let isEligible = $state<boolean>(false);
	let selectedLoanAmount = $state<number>(0);
	let loanAmount = $state<number>(0);
	let termMonths = $state<number>(3);
	let monthlyPayment = $state<number>(0);
	let collateralRequired = $state<number>(0);
	let isLoading = $state(false);
	let isRequestingLoan = $state(false);
	let isWithdrawingLoan = $state(false);
	let isMakingPayment = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let availableLoanOptions = $state<Array<{ amount: number; label: string }>>([]);

	// Estado del préstamo existente
	let existingLoan = $state<any>(null);
	let nextPaymentDue = $state<any>(null);

	// Estado de liquidez
	let availableLiquidity = $state<number>(0);
	let isCheckingLiquidity = $state(false);

	// Calcular detalles del préstamo basado en score
	function calculateLoanDetails() {
		if (!creditScore) return;

		// Obtener opciones disponibles
		availableLoanOptions = getAvailableLoanOptions();

		// Si no hay selección previa, usar la primera opción disponible
		if (selectedLoanAmount === 0 && availableLoanOptions.length > 0) {
			selectedLoanAmount = availableLoanOptions[0].amount;
		}

		// Usar el monto seleccionado
		loanAmount = selectedLoanAmount / 1000000; // Convertir a STX

		// Calcular colateral (150% del préstamo)
		collateralRequired = loanAmount * 1.5;

		// Calcular pago mensual (préstamo + 10% fee) / meses
		const totalDebt = loanAmount + loanAmount * 0.1;
		monthlyPayment = totalDebt / termMonths;
	}

	// Obtener opciones de préstamo disponibles
	function getAvailableLoanOptions(): Array<{ amount: number; label: string }> {
		if (!creditScore) return [];

		const options: Array<{ amount: number; label: string }> = [];

		if (creditScore >= 700) {
			options.push(
				{ amount: 10000000, label: 'Basic Loan - 10 STX' },
				{ amount: 25000000, label: 'Standard Loan - 25 STX' },
				{ amount: 50000000, label: 'Premium Loan - 50 STX' }
			);
		} else if (creditScore >= 500) {
			options.push(
				{ amount: 10000000, label: 'Basic Loan - 10 STX' },
				{ amount: 25000000, label: 'Standard Loan - 25 STX' }
			);
		} else if (creditScore >= 300) {
			options.push({ amount: 10000000, label: 'Basic Loan - 10 STX' });
		}

		return options;
	}

	// FIXED: Solicitar préstamo - ENVÍA selectedLoanAmount
	async function requestLoan() {
		if (!isEligible || !$walletStore.isConnected || !creditScore) {
			errorMessage = 'Not eligible for loan, wallet not connected, or credit score not loaded';
			return;
		}

		isRequestingLoan = true;
		errorMessage = '';
		successMessage = '';

		try {
			const { requestLoan } = await import('$lib/services/loanService');

			// CORREGIDO: Enviar creditScore, selectedLoanAmount, y termMonths
			const txId = await requestLoan(creditScore, selectedLoanAmount, termMonths);

			successMessage = `Loan request submitted! Transaction ID: ${txId}. Now call "Withdraw Loan" to receive your ${loanAmount.toFixed(2)} STX.`;

			setTimeout(() => {
				loadLoanInfo();
				loadAvailableLiquidity();
			}, 10000); // Aumentado a 10 segundos
		} catch (error) {
			console.error('Error requesting loan:', error);
			errorMessage =
				error instanceof Error ? error.message : 'Failed to request loan. Please try again.';
		} finally {
			isRequestingLoan = false;
		}
	}

	// Withdraw loan
	async function withdrawLoan() {
		if (!$walletStore.isConnected) {
			errorMessage = 'Wallet not connected';
			return;
		}

		isWithdrawingLoan = true;
		errorMessage = '';
		successMessage = '';

		try {
			const { withdrawLoan } = await import('$lib/services/loanService');

			const txId = await withdrawLoan();

			successMessage = `Loan withdrawn successfully! Transaction ID: ${txId}. You have received ${loanAmount.toFixed(2)} STX.`;

			setTimeout(() => {
				loadLoanInfo();
				loadAvailableLiquidity();
			}, 10000);
		} catch (error) {
			console.error('Error withdrawing loan:', error);
			errorMessage =
				error instanceof Error ? error.message : 'Failed to withdraw loan. Please try again.';
		} finally {
			isWithdrawingLoan = false;
		}
	}

	// Cargar información del préstamo
	async function loadLoanInfo() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			return;
		}

		try {
			const { getLoanInfo, getNextPaymentDue } = await import('$lib/services/loanService');

			const loanInfo = await getLoanInfo($walletStore.address);
			existingLoan = loanInfo;

			if (loanInfo && loanInfo.isActive) {
				const paymentInfo = await getNextPaymentDue($walletStore.address);
				nextPaymentDue = paymentInfo;
			} else {
				nextPaymentDue = null;
			}
		} catch (error) {
			console.error('Error loading loan info:', error);
			existingLoan = null;
			nextPaymentDue = null;
		}
	}

	// Cargar score del usuario
	async function loadCreditScore() {
		if (!$walletStore.isConnected || !$walletStore.address) {
			return;
		}

		isLoading = true;
		try {
			const { getUserScore } = await import('$lib/services/loanService');
			const contractScore = await getUserScore($walletStore.address);

			if (contractScore) {
				creditScore = contractScore.score;
				isEligible = contractScore.score >= 300;
			} else {
				const { apiServices } = await import('$lib/services/apiServices');
				const response = await apiServices.getCreditScore($walletStore.address);

				if (response) {
					creditScore = response.score;
					isEligible = response.isEligible;
				}
			}

			calculateLoanDetails();
		} catch (error) {
			console.error('Error loading credit score:', error);
			try {
				const { apiServices } = await import('$lib/services/apiServices');
				const response = await apiServices.getCreditScore($walletStore.address);

				if (response) {
					creditScore = response.score;
					isEligible = response.isEligible;
					calculateLoanDetails();
				}
			} catch (fallbackError) {
				console.error('Fallback credit score calculation failed:', fallbackError);
			}
		} finally {
			isLoading = false;
		}
	}

	// Cargar liquidez disponible
	async function loadAvailableLiquidity() {
		isCheckingLiquidity = true;
		try {
			const { getAvailableLiquidity } = await import('$lib/services/loanService');
			availableLiquidity = await getAvailableLiquidity();
		} catch (error) {
			console.error('Error loading available liquidity:', error);
			availableLiquidity = 0;
		} finally {
			isCheckingLiquidity = false;
		}
	}

	// Efecto para cargar datos iniciales
	$effect(() => {
		if ($walletStore.isConnected) {
			loadCreditScore();
			loadLoanInfo();
			loadAvailableLiquidity();
		}
	});

	// Hacer pago mensual
	async function makePayment() {
		if (!$walletStore.isConnected) {
			errorMessage = 'Wallet not connected';
			return;
		}

		isMakingPayment = true;
		errorMessage = '';
		successMessage = '';

		try {
			const { makePayment } = await import('$lib/services/loanService');

			const txId = await makePayment();

			successMessage = `Payment submitted successfully! Transaction ID: ${txId}`;
			loadLoanInfo();
			loadAvailableLiquidity();
		} catch (error) {
			console.error('Error making payment:', error);
			errorMessage =
				error instanceof Error ? error.message : 'Failed to make payment. Please try again.';
		} finally {
			isMakingPayment = false;
		}
	}
</script>

<Guardian>
	<div class="min-h-screen px-4 py-10 sm:px-10 sm:py-20 lg:px-40">
		<div class="mx-auto max-w-2xl">
			<!-- Page Title -->
			<div class="mb-8 text-center sm:mb-12">
				<h1
					class="mb-3 text-3xl font-black text-white drop-shadow-[0_4px_4px_rgba(168,85,247,0.5)] sm:text-4xl md:text-5xl"
				>
					Loan <span
						class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
						>Application</span
					>
				</h1>
				<p class="px-4 text-base font-bold text-gray-300 sm:text-lg">
					Get a loan based on your credit score
				</p>
			</div>

			<!-- Credit Score Display -->
			{#if creditScore !== null}
				<div class="group relative mb-6">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-purple-600 to-cyan-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-cyan-300 to-purple-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6"
					>
						<div class="text-center">
							<h3 class="text-lg font-black text-black sm:text-xl">Your Credit Score</h3>
							<div class="text-3xl font-black text-black sm:text-4xl">{creditScore}</div>
							<p class="text-sm font-bold text-black/70">
								{#if creditScore >= 700}
									High Score - Excellent Terms
								{:else if creditScore >= 500}
									Medium Score - Good Terms
								{:else}
									Low Score - Basic Terms
								{/if}
							</p>
							<div class="mt-2">
								{#if isEligible}
									<span
										class="inline-block rounded bg-green-500 px-3 py-1 text-sm font-black text-white"
									>
										ELIGIBLE FOR LOAN
									</span>
								{:else}
									<span
										class="inline-block rounded bg-red-500 px-3 py-1 text-sm font-black text-white"
									>
										NOT ELIGIBLE
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Existing Loan Info -->
			{#if existingLoan}
				<div class="group relative mb-6">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-amber-600 to-orange-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-amber-300 to-orange-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6"
					>
						<h3 class="mb-3 text-lg font-black text-black">Active Loan</h3>
						<div class="space-y-2 text-sm font-bold text-black">
							<p>Amount: {(existingLoan.amount / 1000000).toFixed(2)} STX</p>
							<p>Monthly Payment: {(existingLoan.monthlyPayment / 1000000).toFixed(6)} STX</p>
							<p>Payments Made: {existingLoan.paymentsMade}/{existingLoan.totalPayments}</p>
							<p>
								Status: {existingLoan.isActive ? 'Active' : 'Completed'}{existingLoan.isDefaulted
									? ' (Defaulted)'
									: ''}
								{existingLoan.loanWithdrawn ? '✓ Withdrawn' : '⏳ Pending Withdrawal'}
							</p>
							{#if nextPaymentDue}
								<div class="mt-3 rounded bg-white/50 p-2">
									<p class="text-xs">
										Next Payment: {(nextPaymentDue.amount / 1000000).toFixed(6)} STX
									</p>
									<p class="text-xs">Due: Block {nextPaymentDue.dueBlock}</p>
									{#if nextPaymentDue.isOverdue}
										<p class="text-xs font-bold text-red-600">OVERDUE</p>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Withdraw Loan Button -->
						{#if existingLoan.isActive && !existingLoan.loanWithdrawn}
							<button
								onclick={() => withdrawLoan()}
								disabled={!$walletStore.isConnected || isWithdrawingLoan}
								class="border-3 mt-4 w-full border-black bg-blue-500 py-2 text-sm font-black text-white transition-transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
							>
								{isWithdrawingLoan ? 'WITHDRAWING...' : 'WITHDRAW LOAN'}
							</button>
						{/if}

						<!-- Make Payment Button -->
						{#if existingLoan.isActive && existingLoan.loanWithdrawn && !existingLoan.isDefaulted && nextPaymentDue && !nextPaymentDue.isOverdue}
							<button
								onclick={() => makePayment()}
								disabled={!$walletStore.isConnected || isMakingPayment}
								class="border-3 mt-4 w-full border-black bg-orange-500 py-2 text-sm font-black text-white transition-transform hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
							>
								{isMakingPayment ? 'PROCESSING...' : 'MAKE PAYMENT'}
							</button>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Liquidity Warning -->
			{#if isEligible && !existingLoan && availableLiquidity < selectedLoanAmount}
				<div class="group relative mb-6">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-yellow-600 to-amber-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-yellow-300 to-amber-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6"
					>
						<div class="text-center">
							<p class="text-sm font-bold text-black">
								{#if availableLiquidity === 0}
									The lending pool is currently empty. Contact administrators to fund it.
								{:else}
									Insufficient liquidity. Available: {(availableLiquidity / 1000000).toFixed(2)} STX.
									Required: {(selectedLoanAmount / 1000000).toFixed(2)} STX.
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Loan Application Form -->
			{#if isEligible && !existingLoan && availableLiquidity >= selectedLoanAmount}
				<div class="group relative">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-purple-600 to-cyan-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-cyan-300 to-purple-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6 md:p-8"
					>
						<h2 class="mb-4 text-xl font-black text-black sm:text-2xl">Apply for Loan</h2>

						<!-- Liquidity Info -->
						<div class="mb-4 rounded bg-white/50 p-3">
							<p class="text-sm font-bold text-black">
								Available Liquidity: {(availableLiquidity / 1000000).toFixed(2)} STX
							</p>
						</div>

						<!-- Loan Amount Selection -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-black text-black">Select Loan Amount</label>
							<select
								bind:value={selectedLoanAmount}
								onchange={calculateLoanDetails}
								class="border-3 mb-2 w-full border-black bg-white px-3 py-2 text-sm font-black text-black"
							>
								{#each availableLoanOptions as option}
									<option value={option.amount}>{option.label}</option>
								{/each}
							</select>
							<div class="text-lg font-black text-black">Selected: {loanAmount.toFixed(2)} STX</div>
						</div>

						<!-- Term Selection -->
						<div class="mb-4">
							<label class="mb-2 block text-sm font-black text-black">Loan Term</label>
							<select
								bind:value={termMonths}
								onchange={calculateLoanDetails}
								class="border-3 w-full border-black bg-white px-3 py-2 text-sm font-black text-black"
							>
								<option value={1}>1 month</option>
								<option value={3}>3 months</option>
								<option value={6}>6 months</option>
								<option value={9}>9 months</option>
							</select>
						</div>

						<!-- Loan Details -->
						<div class="mb-6 space-y-2">
							<div class="flex justify-between text-sm font-bold text-black">
								<span>Monthly Payment:</span>
								<span>{monthlyPayment.toFixed(6)} STX</span>
							</div>
							<div class="flex justify-between text-sm font-bold text-black">
								<span>Collateral Required:</span>
								<span>{collateralRequired.toFixed(2)} STX</span>
							</div>
							<div class="flex justify-between text-sm font-bold text-black">
								<span>Total Interest (10%):</span>
								<span>{(loanAmount * 0.1).toFixed(6)} STX</span>
							</div>
						</div>

						<!-- Error/Success Messages -->
						{#if errorMessage}
							<div class="border-3 mb-4 border-red-600 bg-red-300 p-3 font-bold text-red-800">
								{errorMessage}
							</div>
						{/if}

						{#if successMessage}
							<div class="border-3 mb-4 border-green-600 bg-green-300 p-3 font-bold text-green-800">
								{successMessage}
							</div>
						{/if}

						<!-- Apply Button -->
						<button
							onclick={requestLoan}
							disabled={isRequestingLoan || !$walletStore.isConnected}
							class="group/btn border-3 relative w-full cursor-pointer overflow-hidden border-black bg-white py-3 text-base font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-[4px_4px_0px_0px_rgba(156,163,175,0.5)] disabled:hover:translate-x-0 disabled:hover:translate-y-0 sm:border-4 sm:py-4 sm:text-lg"
						>
							{#if !$walletStore.isConnected}
								CONNECT WALLET FIRST
							{:else if isRequestingLoan}
								SUBMITTING APPLICATION...
							{:else}
								APPLY FOR LOAN
							{/if}
						</button>
					</div>
				</div>
			{/if}

			<!-- Not Eligible Message -->
			{#if !isEligible && creditScore !== null}
				<div class="group relative">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-red-600 to-pink-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-red-300 to-pink-400 p-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4 sm:p-6"
					>
						<div class="text-center">
							<h3 class="mb-2 text-lg font-black text-black">Not Eligible for Loan</h3>
							<p class="mb-4 text-sm font-bold text-black/70">
								Your credit score doesn't qualify for a loan yet.
							</p>
							<a
								href="/credit-score"
								class="border-3 inline-block border-black bg-white px-4 py-2 text-sm font-black text-black transition-transform hover:translate-x-1 hover:translate-y-1"
							>
								VIEW CREDIT SCORE
							</a>
						</div>
					</div>
				</div>
			{/if}

			<!-- Loading State -->
			{#if isLoading}
				<div class="group relative">
					<div
						class="border-3 bg-linear-to-br absolute inset-0 translate-x-2 translate-y-2 border-black from-gray-600 to-gray-600 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 sm:translate-x-3 sm:translate-y-3 sm:border-4 sm:group-hover:translate-x-4 sm:group-hover:translate-y-4"
					></div>
					<div
						class="border-3 bg-linear-to-br relative border-black from-gray-300 to-gray-400 p-8 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 sm:border-4"
					>
						<div class="text-center">
							<p class="text-sm font-black text-black">Loading your loan information...</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Info Cards -->
			<div class="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3">
				<div class="relative">
					<div
						class="border-3 absolute inset-0 translate-x-1.5 translate-y-1.5 border-black bg-purple-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="border-3 relative border-black bg-purple-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<p class="text-sm font-black text-black">Low Risk</p>
						<p class="text-xs font-bold text-black/70">700+ score</p>
					</div>
				</div>

				<div class="relative">
					<div
						class="border-3 absolute inset-0 translate-x-1.5 translate-y-1.5 border-black bg-cyan-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="border-3 relative border-black bg-cyan-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<p class="text-sm font-black text-black">Collateral</p>
						<p class="text-xs font-bold text-black/70">150% required</p>
					</div>
				</div>

				<div class="relative">
					<div
						class="border-3 absolute inset-0 translate-x-1.5 translate-y-1.5 border-black bg-pink-600 sm:translate-x-2 sm:translate-y-2 sm:border-4"
					></div>
					<div
						class="border-3 relative border-black bg-pink-400 p-3 text-center sm:border-4 sm:p-4"
					>
						<p class="text-sm font-black text-black">Terms</p>
						<p class="text-xs font-bold text-black/70">1-9 months</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</Guardian>
