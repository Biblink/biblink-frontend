import { SharedImportsModule } from './shared-imports.module';

describe('SharedImportsModule', () => {
  let sharedImportsModule: SharedImportsModule;

  beforeEach(() => {
    sharedImportsModule = new SharedImportsModule();
  });

  it('should create an instance', () => {
    expect(sharedImportsModule).toBeTruthy();
  });
});
