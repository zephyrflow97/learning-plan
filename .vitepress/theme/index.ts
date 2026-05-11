import DefaultTheme from 'vitepress/theme'
import { nextTick, onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import mermaid from 'mermaid'
import './custom.css'

function configureMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: isDark ? 'dark' : 'default'
  })
}

async function renderMermaid() {
  if (typeof document === 'undefined') return

  await nextTick()
  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid'))
  diagrams.forEach((diagram) => {
    if (!diagram.dataset.mermaidSource) {
      diagram.dataset.mermaidSource = diagram.textContent ?? ''
    }
    diagram.textContent = diagram.dataset.mermaidSource
    diagram.removeAttribute('data-processed')
  })
  await mermaid.run({ nodes: diagrams })
}

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const { isDark } = useData()

    onMounted(async () => {
      configureMermaid(isDark.value)
      await renderMermaid()
    })

    watch(
      () => route.path,
      async () => {
        configureMermaid(isDark.value)
        await renderMermaid()
      }
    )

    watch(isDark, async (value) => {
      configureMermaid(value)
      await renderMermaid()
    })
  }
}
