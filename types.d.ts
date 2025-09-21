declare namespace React {
  // 声明所有自定义 Web Component
  declare namespace JSX {
    interface IntrinsicElements {
      // 为你的 color picker 组件添加类型定义

      "upto-color-picker": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          color?: string
          onChange?: (event: CustomEvent) => void
        },
        HTMLElement
      >
    }
  }
}

