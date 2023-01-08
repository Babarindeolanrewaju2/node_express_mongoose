import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const questions = [
  {
    id: '1',
    text: 'What is the name for the Jewish New Year?',
    answers: [
      { answerText: 'a) Hanukkah' },
      { answerText: 'b) Yom Kippur' },
      { answerText: 'c) Kwanza', correct: true },
      { answerText: 'd) Rosh Hashanah' },
    ],
  },
  {
    id: '2',
    text: 'How many blue stripes are there on the U.S. flag?',
    answers: [
      { answerText: 'a) 6' },
      { answerText: 'b) 7' },
      { answerText: 'c) 13', correct: true },
      { answerText: 'd) 0' },
    ],
  },
  // ...
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
        if (
          state.questions[i].answers.find((a) => a.correct).answerText ===
          state.answers[i]
        ) {
          correctAnswers++;
        }
      }
      commit('setCorrectAnswers', correctAnswers);
    },
  },
});
