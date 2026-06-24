/**
 * 事件总线 - 解耦组件间通信
 */

type EventHandler = (...args: any[]) => void;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    
    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, ...args: any[]) {
    this.handlers.get(event)?.forEach(handler => handler(...args));
  }
}

export const events = new EventBus();

// 预定义事件名称
export const Events = {
  PROP_CHANGED: 'propChanged',
  BUILD_APP: 'buildApp',
} as const;
