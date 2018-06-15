import { OrganizationModule } from './organization.module';

describe('OrganizationModule', () => {
  let organizationModule: OrganizationModule;

  beforeEach(() => {
    organizationModule = new OrganizationModule();
  });

  it('should create an instance', () => {
    expect(organizationModule).toBeTruthy();
  });
});
