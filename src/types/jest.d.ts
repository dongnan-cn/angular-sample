// Jest 全局类型声明文件
/// <reference types="jest" />
/// <reference types="node" />

// 扩展全局 Window 接口
declare global {
  interface Window {
    CSS: any;
    getComputedStyle: any;
    matchMedia: any;
  }

  // 扩展全局对象
  var ResizeObserver: any;
  var IntersectionObserver: any;
  
  // 全局 global 对象
  var global: typeof globalThis;

  // Node.js 进程对象
  namespace NodeJS {
    interface Process {
      on(event: 'unhandledRejection', listener: (reason: any) => void): this;
    }
  }
}

export {};