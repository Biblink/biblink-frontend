
export class Discussion {
    constructor(
        public id = '',
        public title = '',
        public text = '',
        public creatorID = '',
        public creatorName = '',
        public timestamp = {},
        public dateInfo = { date: '', time: '' }
    ) { }
}
