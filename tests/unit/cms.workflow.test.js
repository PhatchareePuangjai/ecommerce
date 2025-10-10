const { canTransition, transition } = require('../../src/services/cms/workflow');

describe('CMS Workflow', () => {
  test('valid transitions', () => {
    expect(canTransition('draft', 'submit')).toBe('review');
    expect(canTransition('review', 'approve')).toBe('approved');
    expect(canTransition('approved', 'publish')).toBe('published');
    expect(canTransition('published', 'unpublish')).toBe('draft');
  });

  test('transition updates status and audit', () => {
    const c = { id: 'ART1', status: 'draft', audit: [] };
    const r1 = transition(c, 'submit', 'tester', new Date('2025-01-01T00:00:00Z'));
    expect(r1.status).toBe('review');
    expect(r1.audit).toHaveLength(1);
    const r2 = transition(r1, 'approve', 'tester2');
    expect(r2.status).toBe('approved');
  });

  test('publish sets publishedAt; unpublish clears it', () => {
    const c = { id: 'ART2', status: 'approved', audit: [] };
    const pub = transition(c, 'publish');
    expect(pub.status).toBe('published');
    expect(pub.publishedAt).toBeTruthy();
    const unpub = transition(pub, 'unpublish');
    expect(unpub.status).toBe('draft');
    expect(unpub.publishedAt).toBeFalsy();
  });
});

