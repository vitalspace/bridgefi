import axios from './axios';

export const apiServices = {
    // Price related API calls
    async getPrices() {
        const response = await axios.get('/prices');
        return response.data;
    },

    async getQuote(fromToken: string, toToken: string, amount: number) {
        const response = await axios.post('/prices/quote', {
            fromToken,
            toToken,
            amount
        });
        return response.data;
    },

    // Swap related API calls
    async createSwapOrder(data: {
        stxAmount?: number;
        destinationChain?: string;
        destinationAddress?: string;
        destinationToken?: string;
        expectedAmount?: number;
        user?: string;
        txId?: string;
    }) {
        const response = await axios.post('/create-order', data);
        return response.data;
    },

    async getOrderStatus(orderId: string) {
        const response = await axios.get(`/order/${orderId}`);
        return response.data;
    },

    async pollOrderStatus(orderId: number) {
        const response = await axios.post('/poll-order', { orderId });
        return response.data;
    },

    // User related API calls
    async createUser(data: {
        address: string;
        avatar?: string;
        banner?: string;
        username?: string;
        email?: string;
        bio?: string;
    }) {
        const response = await axios.post('/create-user', data);
        return response.data;
    },

    async getProfile(address: string) {
        const response = await axios.post('/profile', { address });
        return response.data;
    },

    async updateUser(data: {
        address: string;
        username?: string;
        email?: string;
        avatar?: string;
        banner?: string;
        bio?: string;
    }) {
        const response = await axios.put('/update-user', data);
        return response.data;
    },

    async getUserActivity(address: string) {
        const response = await axios.post('/activity', { address });
        return response.data;
    },

    async getUserStats(address: string) {
        const response = await axios.post('/stats', { address });
        return response.data;
    },

    async getCreditScore(address: string) {
        const response = await axios.post('/credit-score', { address });
        return response.data;
    }
};
