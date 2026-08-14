import { describe, it, expect } from 'vitest';
import { CASE_STUDIES, findCaseBySlug, findNextCase } from './cases';
import caseRoutes from './case-routes.json';

describe('CASE_STUDIES', () => {
  it('stays in sync with the prerendered route list', () => {
    expect(caseRoutes).toEqual(CASE_STUDIES.map(c => ({ slug: c.slug, title: c.title })));
  });

  it('resolves a case by slug', () => {
    expect(findCaseBySlug('crash-game')?.title).toBe('Crash Game');
    expect(findCaseBySlug('nope')).toBeUndefined();
  });

  it('wraps around to the first case after the last', () => {
    const last = CASE_STUDIES[CASE_STUDIES.length - 1];
    expect(findNextCase(last.slug).slug).toBe(CASE_STUDIES[0].slug);
  });
});
