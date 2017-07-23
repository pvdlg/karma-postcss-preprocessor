describe('Css file', () => {
  beforeAll(() => {
    jasmine.getFixtures().fixturesPath = 'base';
  });

  it('shoud be compiled by Karma and loaded', () => {
    const $fixture = $('<div class="test"></div>');

    appendSetFixtures($fixture);
    expect($fixture).toHaveCss({height: '20px'});
  });
});
