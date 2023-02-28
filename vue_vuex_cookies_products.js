import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const api = axios.create({
    baseURL: 'http://localhost:3000' // URL of your cookie API
})

const store = new Vuex.Store({
    state: {
        cookies: [],
        currentCookie: {}
    },
    mutations: {
        setCookies(state, cookies) {
            state.cookies = cookies
        },
        setCurrentCookie(state, cookie) {
            state.currentCookie = cookie
        }
    },
    actions: {
        async getCookies({
            commit
        }) {
            const response = await axios.get('/cookies')
            commit('setCookies', response.data)
        },
        async getCookie({
            commit
        }, name) {
            const response = await axios.get(`/cookies/${name}`)
            commit('setCurrentCookie', response.data)
        },
        async createCookie({
            dispatch
        }, cookie) {
            await axios.post('/cookies', cookie)
            dispatch('getCookies')
        },
        async updateCookie({
            dispatch
        }, {
            name,
            cookie
        }) {
            await axios.put(`/cookies/${name}`, cookie)
            dispatch('getCookies')
        },
        async deleteCookie({
            dispatch
        }, name) {
            await axios.delete(`/cookies/${name}`)
            dispatch('getCookies')
        }
    }
})

export default store
