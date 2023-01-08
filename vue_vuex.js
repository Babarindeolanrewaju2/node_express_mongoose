import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const questions = [
  {
    question: 'What is the capital of France?',
    choices: ['Paris', 'London', 'Madrid', 'Rome'],
    correctAnswer: 'Paris',
  },
  {
    question: 'What is the largest planet in the solar system?',
    choices: ['Earth', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswer: 'Jupiter',
  },
  {
    question: 'What is the currency of Japan?',
    choices: ['Dollar', 'Euro', 'Yen', 'Pound'],
    correctAnswer: 'Yen',
  },
];

export default new Vuex.Store({
  state: {
    questions: questions,
    answers: [],
    correctAnswers: 0,
  },
  mutations: {
    setAnswers(state, answers) {
      state.answers = answers;
    },
    setCorrectAnswers(state, correctAnswers) {
      state.correctAnswers = correctAnswers;
    },
  },
  actions: {
    submitAnswers({ commit, state }) {
      let correctAnswers = 0;
      for (let i = 0; i < state.questions.length; i++) {
        if (state.questions[i].correctAnswer === state.answers[i]) {
          correctAnswers++;
        }
      }
      commit('setCorrectAnswers', correctAnswers);
    },
  },
});
