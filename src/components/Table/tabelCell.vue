<script type="text/jsx" lang="ts">
import { defineComponent, PropType } from 'vue'

interface fn {
    (...args: any[]): any
}

export default defineComponent({
    name: 'YzlTableCell',
    props: {
        renderer: { type: Function as PropType<fn>, required: true },
    },
    render(h) {
        const me = this
        return me.renderer(h)
    },
})
</script>
