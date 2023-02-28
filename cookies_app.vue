<template>
  <div>
    <h1>Cookies App</h1>
    <hr />
    <div v-if="cookies.length">
      <h2>Cookies</h2>
      <ul>
        <li v-for="cookie in cookies" :key="cookie.name">
          <router-link
            :to="{ name: 'cookie', params: { name: cookie.name } }"
            >{{ cookie.name }}</router-link
          >
          <button @click="deleteCookie(cookie.name)">Delete</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No cookies found</p>
    </div>
    <hr />
    <router-view></router-view>
    <hr />
    <h2>New Cookie</h2>
    <form @submit.prevent="createCookie">
      <div>
        <label>Name:</label>
        <input type="text" v-model="newCookie.name" />
      </div>
      <div>
        <label>Price:</label>
        <input type="number" v-model="newCookie.price" />
      </div>
      <div>
        <label>Premium:</label>
        <input type="checkbox" v-model="newCookie.premium" />
      </div>
      <div>
        <label>Offer:</label>
        <input type="text" v-model="newCookie.offer" />
      </div>
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      newCookie: {
        name: '',
        price: '',
        premium: false,
        offer: '',
      },
    };
  },
  methods: {
    ...mapActions(['createCookie']),
    async onSubmit() {
      await this.createCookie(this.newCookie);
      this.$router.push('/');
    },
  },
};
</script>
