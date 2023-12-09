import { SafeURLPipe } from './safe-url.pipe';

xdescribe('SafeURLPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeURLPipe();
    expect(pipe).toBeTruthy();
  });
});
