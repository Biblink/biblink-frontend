import { UserAuthModule } from './user-auth.module';

describe('UserAuthModule', () => {
  let userAuthModule: UserAuthModule;

  beforeEach(() => {
    userAuthModule = new UserAuthModule();
  });

  it('should create an instance', () => {
    expect(userAuthModule).toBeTruthy();
  });
});
