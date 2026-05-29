import { describe, expect, it } from 'vitest';
import { getProgramFormSetupState } from '../../lib/programFormSetup';

describe('programFormSetup', () => {
  it('requires a form to exist', () => {
    expect(getProgramFormSetupState([], null).status).toBe('no_forms');
  });

  it('requires an active selection', () => {
    expect(getProgramFormSetupState([{ id: 'f1', title: 'Form A', is_active: true }], null).status).toBe('no_selection');
  });

  it('requires the selected form to be published', () => {
    expect(getProgramFormSetupState([{ id: 'f1', title: 'Form A', is_active: false }], 'f1').status).toBe('unpublished');
  });

  it('is ready when a published form is selected', () => {
    expect(getProgramFormSetupState([{ id: 'f1', title: 'Form A', is_active: true }], 'f1').status).toBe('ready');
  });
});
