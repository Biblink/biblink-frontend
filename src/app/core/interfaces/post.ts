
export class Post {
    constructor(
        public title = '',
        public type = '',
        public text = '',
        public htmlText = '',
        public creatorID = '',
        public timestamp = {},
        public dateInfo = { date: '', time: '' },
        public verses = [],
        public links = [],
        public contributors = [],
        public replies = []
    ) { }
}
