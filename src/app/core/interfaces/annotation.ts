
export class Annotation {
    constructor(
        public chapterReference = '',
        public passage = '',
        public type = '',
        public text = '',
        public htmlText = '',
        public creatorID = '',
        public timestamp = {},
        public dateInfo = { date: '', time: '' },
        public verses = [],
        public links = [],
        public replies = [],
        public verse_search = 0
    ) { }
}
