import {
  mdiContentCopy,
  mdiChevronLeft,
  mdiChevronRight,
  mdiCog,
  mdiClose,
  mdiTrashCan
} from '@mdi/js'

const mdi = new Map<string, string>([
  ['content-copy', mdiContentCopy ],
  ['chevron-left', mdiChevronLeft ],
  ['chevron-right', mdiChevronRight ],
  ['cog', mdiCog],
  ['close', mdiClose],
  ['trash-can', mdiTrashCan]
])

export default mdi
