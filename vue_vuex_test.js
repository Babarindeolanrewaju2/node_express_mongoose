import { expect } from 'chai';
import store from './store';

describe('Vuex store', () => {
  it('has the correct initial state', () => {
    expect(store.state.questions).to.deep.equal(questions);
    expect(store.state.answers).to.deep.equal([]);
    expect(store.state.correctAnswers).to.equal(0);
  });

  it('sets the answers correctly', () => {
    store.commit('setAnswers', ['b) Yom Kippur', 'c) 13']);
    expect(store.state.answers).to.deep.equal(['b) Yom Kippur', 'c) 13']);
  });

  it('sets the correct answers correctly', () => {
    store.commit('setCorrectAnswers', 2);
    expect(store.state.correctAnswers).to.equal(2);
  });

  it('submits the answers correctly', () => {
    store.commit('setAnswers', ['b) Yom Kippur', 'c) 13', 'b) Elon Musk']);
    store.dispatch('submitAnswers');
    expect(store.state.correctAnswers).to.equal(3);
  });
});
