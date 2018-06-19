import { StudyModule } from './study.module';

describe('StudyModule', () => {
  let studyModule: StudyModule;

  beforeEach(() => {
    studyModule = new StudyModule();
  });

  it('should create an instance', () => {
    expect(studyModule).toBeTruthy();
  });
});
