<script lang="ts">
	import { useWallet } from '$lib/hooks/useWallet';
	import { apiServices } from '$lib/services/apiServices';
	import { getLoanInfo, getNextPaymentDue } from '$lib/services/loanService';
	import { onMount } from 'svelte';

	import Guardian from '$lib/components/ui/Guardian.svelte';

	type Profile = {
		_id?: { $oid: string };
		address: string;
		avatar: string;
		banner: string;
		username: string;
		email: string;
		bio: string;
		createdAt?: { $date: string };
		updatedAt?: { $date: string };
		__v?: number;
	};

	const { address } = useWallet();

	let activeTab = $state('overview');
	let userProfile: Profile | null = $state.raw(null);
	let loading = $state(false);
	let error: string | null = $state.raw(null);
	let editing = $state(false);
	let formData = $state({
		username: '',
		email: '',
		bio: '',
		avatar: '',
		banner: ''
	});

	// NUEVO: Estado para loans
	let loanInfo = $state<any>(null);
	let nextPayment = $state<any>(null);
	let loadingLoan = $state(false);

	async function fetchProfile() {
		if (!$address) return;

		loading = true;
		error = null;
		try {
			const profile = await apiServices.getProfile($address);
			userProfile = profile;
			if (userProfile) {
				formData = {
					username: userProfile.username || '',
					email: userProfile.email || '',
					bio: userProfile.bio || '',
					avatar: userProfile.avatar || '',
					banner: userProfile.banner || ''
				};
			}

			// Fetch user activity
			const activity = await apiServices.getUserActivity($address);
			recentActivity = activity.map((swap: any) => ({
				type: 'Swap',
				from: 'STX',
				to: swap.destinationToken,
				amount: swap.stxAmount,
				expectedAmount: (parseFloat(swap.expectedAmount) / 1000000).toFixed(6),
				date: new Date(swap.createdAt).toLocaleDateString(),
				status: swap.status
			}));

			// Fetch user stats
			const userStats = await apiServices.getUserStats($address);
			stats = [
				{ label: 'Total Swaps', value: userStats.totalSwaps.toString(), change: '+12%' },
				{ label: 'Volume', value: `${userStats.volume} STX`, change: '+8%' },
				{ label: 'Success Rate', value: userStats.successRate, change: '+2%' },
				{ label: 'Active Days', value: userStats.activeDays.toString(), change: '+5%' }
			];
		} catch (err) {
			error = 'Failed to load profile';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	// NUEVO: Cargar información de préstamo
	async function fetchLoanInfo() {
		if (!$address) return;

		loadingLoan = true;
		try {
			const loan = await getLoanInfo($address);
			loanInfo = loan;

			if (loan && loan.isActive) {
				const payment = await getNextPaymentDue($address);
				nextPayment = payment;
			}
		} catch (err) {
			console.error('Error loading loan info:', err);
		} finally {
			loadingLoan = false;
		}
	}

	async function updateProfile() {
		if (!$address) return;

		loading = true;
		error = null;
		try {
			const updatedData = {
				address: $address,
				...(formData.username && { username: formData.username }),
				...(formData.email && { email: formData.email }),
				...(formData.bio && { bio: formData.bio }),
				...(formData.avatar && { avatar: formData.avatar }),
				...(formData.banner && { banner: formData.banner })
			};
			const updatedProfile = await apiServices.updateUser(updatedData);
			userProfile = updatedProfile;
			editing = false;
		} catch (err) {
			error = 'Failed to update profile';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (!$address) return;
		fetchProfile();
		fetchLoanInfo(); // NUEVO: Cargar loans
	});

	let stats = $state([
		{ label: 'Total Swaps', value: '24', change: '+12%' },
		{ label: 'Volume', value: '$5,420', change: '+8%' },
		{ label: 'Success Rate', value: '98%', change: '+2%' },
		{ label: 'Active Days', value: '15', change: '+5%' }
	]);

	let recentActivity = $state([
		{
			type: 'Swap',
			from: 'ETH',
			to: 'USDC',
			amount: '0.5',
			expectedAmount: '1500',
			date: '2h ago',
			status: 'completed'
		}
	]);
</script>

<Guardian>
	<div class="min-h-screen p-4">
		<!-- Contenedor principal con doble capa -->
		<div class="relative mx-auto max-w-2xl">
			<!-- Capa de fondo (sombra amarilla) -->
			<div
				class="absolute inset-0 translate-x-2 translate-y-2 border-4 border-black bg-purple-500"
			></div>

			<!-- Capa principal -->
			<div class="relative border-4 border-black bg-cyan-400">
				<!-- Banner -->
				<div
					class="h-24 border-b-4 border-black bg-gradient-to-r from-cyan-400 to-yellow-400 sm:h-32"
					style="background-image: url({userProfile?.banner}); background-size: cover; background-position: center;"
				></div>

				<!-- Profile Info -->
				<div class="relative px-4 pb-4">
					<!-- Avatar -->
					<div
						class="absolute -top-8 h-16 w-16 border-4 border-black bg-[#FFB627] sm:-top-10 sm:h-20 sm:w-20"
						style="background-image: url({userProfile?.avatar}); background-size: cover; background-position: center;"
					></div>

					<!-- Content -->
					<div class="flex items-start justify-between pt-10">
						<div>
							{#if userProfile}
								<div
									class="mt-2 mb-2 inline-block cursor-pointer border-3 border-black bg-gradient-to-r from-yellow-200 to-orange-200 px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
								>
									<h1 class="text-xl font-black text-gray-900 uppercase sm:text-2xl">
										{userProfile.username || 'No username'}
									</h1>
								</div>

								<p
									class="mb-2 cursor-pointer border-l-4 border-purple-500 bg-white py-1 pl-3 text-sm font-bold text-gray-900 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-l-[6px] hover:shadow-[3px_3px_0px_0px_rgba(168,85,247,0.3)]"
								>
									{userProfile.bio || 'No bio'}
								</p>
							{/if}
							<div
								class="flex w-fit cursor-pointer items-center gap-2 border-2 border-black bg-black px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(255,182,39,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(255,182,39,1)]"
							>
								<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
								<p class="font-mono text-xs font-bold text-white">
									{$address ? `${$address.slice(0, 6)}...${$address.slice(-4)}` : 'ST23J5...YDNX'}
								</p>
							</div>

							<div class="mt-2 flex gap-2">
								<span
									class="border-2 border-black bg-[#FFB627] px-2 py-1 text-[10px] font-bold uppercase"
									>Active</span
								>
								<span
									class="border-2 border-black bg-[#A3E4F5] px-2 py-1 text-[10px] font-bold uppercase"
									>Verified</span
								>
							</div>
						</div>
						<button
							class="cursor-pointer border-3 border-black bg-gradient-to-r from-yellow-300 to-orange-300 px-4 py-2 text-xs font-black text-gray-900 uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
							onclick={() => {
								editing = !editing;
								if (editing) activeTab = 'settings';
							}}
						>
							{editing ? 'Cancel' : 'Edit Profile'}
						</button>
					</div>
				</div>

				<!-- Tabs -->
				<div class="border-t-4 border-black bg-black px-4 py-3">
					<div class="flex gap-2">
						{#each ['overview', 'loans', 'activity', 'settings'] as tab}
							<button
								onclick={() => (activeTab = tab)}
								class="flex-1 cursor-pointer border-3 border-black px-3 py-2 text-xs font-bold uppercase transition-all {activeTab ===
								tab
									? 'bg-white text-black'
									: 'bg-transparent text-white hover:bg-white/10'}"
							>
								{tab}
							</button>
						{/each}
					</div>
				</div>

				<!-- Content Area -->
				<div class="bg-cyan-400 p-4">
					{#if activeTab === 'overview'}
						<div class="space-y-4">
							<!-- Stats -->
							<div class="grid grid-cols-2 gap-3">
								{#each stats as stat}
									<div class="border-3 border-black bg-[#F5F1E8] p-3">
										<p class="text-[10px] font-bold uppercase opacity-50">
											{stat.label}
										</p>
										<p class="text-xl font-black">{stat.value}</p>
										<p class="text-[10px] font-bold text-[#FFB627]">{stat.change}</p>
									</div>
								{/each}
							</div>

							<!-- NUEVO: Loan Summary Card -->
							{#if loanInfo && loanInfo.isActive}
								<div class="border-3 border-black bg-[#FFB627] p-4">
									<p class="mb-2 text-sm font-black uppercase">Active Loan</p>
									<div class="grid grid-cols-2 gap-2">
										<div>
											<p class="text-[10px] font-bold uppercase opacity-70">Amount</p>
											<p class="text-lg font-black">{(loanInfo.amount / 1000000).toFixed(2)} STX</p>
										</div>
										<div>
											<p class="text-[10px] font-bold uppercase opacity-70">Monthly Payment</p>
											<p class="text-lg font-black">
												{(loanInfo.monthlyPayment / 1000000).toFixed(2)} STX
											</p>
										</div>
										<div>
											<p class="text-[10px] font-bold uppercase opacity-70">Payments</p>
											<p class="text-lg font-black">
												{loanInfo.paymentsMade}/{loanInfo.totalPayments}
											</p>
										</div>
										<div>
											<p class="text-[10px] font-bold uppercase opacity-70">Status</p>
											<p class="text-lg font-black text-green-700">
												{loanInfo.loanWithdrawn ? '✓ Withdrawn' : '⏳ Pending'}
											</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- NUEVO: Loans Tab -->
					{#if activeTab === 'loans'}
						<div class="border-3 border-black bg-[#F5F1E8] p-4">
							{#if loadingLoan}
								<p class="text-xs font-bold">Loading loan information...</p>
							{:else if loanInfo}
								<div class="space-y-3">
									<div class="border-3 border-black bg-white p-3">
										<p class="mb-2 text-sm font-black uppercase">Loan Details</p>
										<div class="space-y-2">
											<div class="flex justify-between text-xs font-bold">
												<span>Loan Amount:</span>
												<span>{(loanInfo.amount / 1000000).toFixed(2)} STX</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Collateral:</span>
												<span>{(loanInfo.collateral / 1000000).toFixed(2)} STX</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Total Debt:</span>
												<span>{(loanInfo.totalDebt / 1000000).toFixed(2)} STX</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Monthly Payment:</span>
												<span>{(loanInfo.monthlyPayment / 1000000).toFixed(2)} STX</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Score Level:</span>
												<span class="uppercase">{loanInfo.scoreLevel}</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Payments Made:</span>
												<span>{loanInfo.paymentsMade}/{loanInfo.totalPayments}</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Status:</span>
												<span class={loanInfo.isActive ? 'text-green-700' : 'text-red-700'}>
													{loanInfo.isActive ? 'ACTIVE' : 'COMPLETED'}
												</span>
											</div>
											<div class="flex justify-between text-xs font-bold">
												<span>Withdrawn:</span>
												<span>{loanInfo.loanWithdrawn ? '✓ Yes' : '✗ No'}</span>
											</div>
										</div>
									</div>

									<!-- NUEVO: Next Payment Info -->
									{#if nextPayment && loanInfo.isActive}
										<div class="border-3 border-black bg-[#A3E4F5] p-3">
											<p class="mb-2 text-sm font-black uppercase">Next Payment Due</p>
											<div class="space-y-2">
												<div class="flex justify-between text-xs font-bold">
													<span>Amount:</span>
													<span>{(nextPayment.amount / 1000000).toFixed(6)} STX</span>
												</div>
												<div class="flex justify-between text-xs font-bold">
													<span>Due Block:</span>
													<span>{nextPayment.dueBlock}</span>
												</div>
												<div class="flex justify-between text-xs font-bold">
													<span>Grace Until:</span>
													<span>{nextPayment.graceUntil}</span>
												</div>
												<div class="flex justify-between text-xs font-bold">
													<span>Status:</span>
													<span
														class={nextPayment.isOverdue
															? 'font-black text-red-700'
															: 'text-green-700'}
													>
														{nextPayment.isOverdue ? '⚠️ OVERDUE' : '✓ ON TIME'}
													</span>
												</div>
											</div>
										</div>
									{/if}
								</div>
							{:else}
								<div class="border-3 border-black bg-white p-4 text-center">
									<p class="mb-3 text-sm font-black uppercase">No active loans</p>
									<a
										href="/request-loan"
										class="inline-block cursor-pointer border-3 border-black bg-gradient-to-r from-yellow-300 to-orange-300 px-4 py-2 text-xs font-black text-gray-900 uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
									>
										Request a Loan
									</a>
								</div>
							{/if}
						</div>
					{/if}

					{#if activeTab === 'activity'}
						<div class="border-3 border-black bg-[#F5F1E8] p-3">
							<p class="mb-3 text-sm font-black uppercase">Recent Activity</p>
							<div class="space-y-2">
								{#each recentActivity as activity}
									<div
										class="flex items-center justify-between border-2 border-black p-2 {activity.status ===
										'completed'
											? 'bg-[#A3E4F5]'
											: 'bg-white'}"
									>
										<div class="flex items-center gap-2">
											<div
												class="h-6 w-6 border-2 border-black {activity.status === 'completed'
													? 'bg-[#FFB627]'
													: 'bg-white'}"
											></div>
											<div>
												<p class="text-xs font-black">
													{activity.from} → {activity.to}
												</p>
												<p class="text-[10px] font-bold opacity-50">
													{activity.date}
												</p>
											</div>
										</div>
										<div class="text-right">
											<p class="text-xs font-black">{activity.amount} STX</p>
											<p class="text-[10px] font-bold opacity-50">
												→ {activity.expectedAmount}
												{activity.to}
											</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if activeTab === 'settings'}
						<div class="border-3 border-black bg-[#F5F1E8] p-4">
							<p class="mb-3 text-sm font-black uppercase">Settings</p>
							{#if loading}
								<p class="text-xs font-bold">Loading...</p>
							{:else if error}
								<p class="text-xs font-bold text-red-600">{error}</p>
							{:else if editing}
								<div class="space-y-3">
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Display Name</label>
										<input
											type="text"
											bind:value={formData.username}
											class="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:ring-2 focus:ring-black focus:outline-none"
											placeholder="Enter name"
										/>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Email</label>
										<input
											type="email"
											bind:value={formData.email}
											class="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:ring-2 focus:ring-black focus:outline-none"
											placeholder="your@email.com"
										/>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Avatar URL</label>
										<input
											type="url"
											bind:value={formData.avatar}
											class="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:ring-2 focus:ring-black focus:outline-none"
											placeholder="https://example.com/avatar.jpg"
										/>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Banner URL</label>
										<input
											type="url"
											bind:value={formData.banner}
											class="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:ring-2 focus:ring-black focus:outline-none"
											placeholder="https://example.com/banner.jpg"
										/>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Bio</label>
										<textarea
											bind:value={formData.bio}
											class="w-full border-2 border-black bg-white p-2 text-xs font-bold focus:ring-2 focus:ring-black focus:outline-none"
											placeholder="Tell us about yourself"
											rows="3"
										></textarea>
									</div>
									<button
										onclick={updateProfile}
										class="w-full border-3 border-black bg-[#FFB627] py-2 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
									>
										Save Changes
									</button>
								</div>
							{:else}
								<div class="space-y-3">
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Display Name</label>
										<p class="text-xs font-bold">{userProfile?.username || 'Not set'}</p>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Email</label>
										<p class="text-xs font-bold">{userProfile?.email || 'Not set'}</p>
									</div>
									<div>
										<label class="mb-1 block text-xs font-bold uppercase">Bio</label>
										<p class="text-xs font-bold">{userProfile?.bio || 'Not set'}</p>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Guardian>
