import { FbTimestampPipe } from './fb-timestamp.pipe';

xdescribe('FbTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new FbTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
