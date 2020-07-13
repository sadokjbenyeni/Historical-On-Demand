import { EqualValidatorDirective } from './equal-validator.directive';

describe('EqualValidatorDirective', () => {
  it('should create an instance', () => {
    const directive = new EqualValidatorDirective('test', 'test');
    expect(directive).toBeTruthy();
  });
});
