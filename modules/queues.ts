type task = { name: string, cb: Function }

type queue = {
  tasks: task[]
  isStopped: boolean
  interval: number,
  tmp: { countAttempts: number }
}


type enqueueArgs = { cb: (attempts: number) => any, taskName: string, queueName?: string }
interface IQueues {
  queues: { [queueName: string]: queue }
  types: { [typeName: string]: Function }
  interval: number

  registerQueue: (queueName: string, interval: number) => queue
  runQueue: (queueName: string) => Promise<void>
  stopQueue: (queueName: string) => void
  enqueue: (args: enqueueArgs) => void
}


export class Queues implements IQueues {
  interval: number = 10;
  queues: Record<string, queue>;
  types: Record<string, Function>;

  /**
   * @param {Number} [interval] - Default interval in ms beetween tasks running. Recommended >=10ms. Default - 10ms.
   */
  constructor(interval?: number ) {
    if (typeof interval =='number') this.interval = interval;
    this.queues = {};
    this.types = {
      "Function": (() => { }).constructor,
      "AsyncFunction": (async () => { }).constructor,
    };
    this.registerQueue("main");
    this.runQueue("main");

  }

  /**
   * Just registers queue with provided interval.
   * @param {String} queueName - Name of queue, for enqueuing and unenqueuing tasks.
   * @param {Number} [interval] - Time of rest in ms beetween running tasks. If not defined - will be used default value from this.interval.
   */
  registerQueue(queueName: string, interval: number = this.interval) {
    return this.queues[queueName] = {
      tasks: [],
      isStopped: true,
      interval,
      tmp: { countAttempts: 0 },
    };
  }

  /**
   * Executes the first task of the queue, until it not returns true and queue.isStopped is false.
   * @param {String} queueName - Name of Queue
   */
  async runQueue(queueName: string) {
    const queue = this.queues[queueName];
    queue.isStopped = false;
    while (!queue.isStopped) {
      const hasTasks = queue.tasks.length > 0;
      if (hasTasks) {
        const task = queue.tasks[0];
        const attempts = queue.tmp.countAttempts++;
        const result =
          task.cb instanceof this.types.AsyncFunction
            ? await task.cb(attempts)
            : task.cb(attempts);

        if (!!result) {
          queue.tasks.shift();
          queue.tmp.countAttempts = 0;
        }
      }
      await this._sleep(queue.interval);
    }
  }

  /**
   * Stops the queue.
   * @param {String} queueName - Name of Queue
   */
  stopQueue(queueName: string) {
    this.queues[queueName].isStopped = true;
  }

  /**
   * Enqueues a task with provded params, like taskName, queueName in the object.
   * @param {Object}   param0
   * @param {Function} param0.cb
   * @param {String}   [param0.taskName] - Name of task for unenqueue possibility.
   * @param {String}   [param0.queueName] - Name of queue. Default - "main".
   */
  enqueue({ cb, taskName, queueName = "main" }: enqueueArgs) {
    this.queues[queueName as keyof IQueues['queues']].tasks.push({ name: taskName, cb });
  }

  /**
   * Unenqueues all tasks by name from the queue.
   * @param  {String} taskName - Name of task name for unenqueue it.
   * @param  {String} [queueName] - Name of queue for unenqueue task. Default "main".
   */
  unenqueue(taskName: string, queueName: string = "main") {
    this.queues[queueName].tasks = this.queues[queueName].tasks.filter(
      (task) => task.name != taskName
    );
  }

  /**
   * Async sleep function.
   * @param {Number} ms - Time for sleep in ms.
   * @returns {Promise<undefined>} Just await it.
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
