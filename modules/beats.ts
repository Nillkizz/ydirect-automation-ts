type task = { name: string, cb: Function }
type beat = {isStopped: boolean, interval:number, tasks: Record<string, Function>}

export class Beats{
  interval: number = 10;
  types: Record<string, Function>;
  beats: Record<string, beat>

  /**
   * @param {Number} [interval] - Default interval in ms beetween tasks running. Recommended >=10ms. Default - 10ms.
   */
  constructor(interval?: number ) {
    if (typeof interval =='number') this.interval = interval;
    this.beats = {};
    this.types = {"AsyncFunction": (async () => { }).constructor};
  }

  registerBeat(name:string, interval:number){
    this.beats[name] = {isStopped:true, interval:interval, tasks: {}}
  }

  async runBeat(beatName:string, awaitBeats:boolean = true){
    const beat = this.beats[beatName];
    beat.isStopped = false;
    while (!beat.isStopped) {
      const hasTasks = Object.keys(beat.tasks).length > 0;
      if (hasTasks) {
        for (const task of Object.values(beat.tasks)){
          if (awaitBeats && task instanceof this.types.AsyncFunction) await task();
          else task();
        }
      }
      await this._sleep(beat.interval);
    }
  }

  addTask(beatName: string, task:task){
    this.beats[beatName].tasks[task.name] = task.cb
  }

  stopBeat(beatName: string) {
    this.beats[beatName].isStopped = true;
  }

  removeTask( beatName: string, taskName: string) {
    delete(this.beats[beatName].tasks[taskName])
  }

  /**
   * Async sleep function.
   * @param {Number} ms - Time for sleep in ms.
   * @returns {Promise<undefined>} Just await it.
   */
  protected _sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
