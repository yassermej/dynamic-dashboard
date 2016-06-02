import TableDispatcher from './table-dispatcher';
import {ActionTypes} from './action';
import EventEmitter from 'events';
import columnsUtils from './column-utils'
const CHANGE_EVENT = 'column-change';
import {OrderedSet, Record} from 'immutable';


/*

 OrderedSet<Record({
 name: 'Name',
 data: 'name',
 width: {flex: 4, },
 display: true,
 filter: {type: 'text', percentage: 30, px: 200}
 }>

 */
const WidthRecord = new Record({flex: 4, px: null, percentage: null});
const ColumnFilter = new Record({type: 'text', percentage: 30, px: 200});
const ColumnRecord = new Record({
  name: null,
  data: null,
  type: 'text',
  width: WidthRecord,
  display: true,
  filter: ColumnFilter
});
var _columns;


class ColumnStoreClass extends EventEmitter {

  constructor() {
    super();
  }

  initStore(columnsConfig) {
    var columns = this.countWidth(columnsConfig);
    columns = this.setDisplay(columns);
    _columns = OrderedSet.of(...columns);
  }

  setDisplay(columns) {
    return columns.map(c=> {
      return new ColumnRecord({...c, display: c.display == undefined ? true : c.display});
    });
  }

  countWidth(columns) {
    var flexSum = columns.map(c=> {
      if(!c.width) c.width = {};
      if(!c.width.flex) c.width.flex = 1;
      return c.width.flex;
    }).reduce((prev, curr) => {
      return prev + curr;
    });

    var portion = 100 / flexSum;

    return columns.map(c => {
      return {...c, width: new WidthRecord({...c.width, percentage: c.width.flex * portion})};
    })
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  getColumns() {
    return _columns;
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}


const hideColumn = (columnName) => {
  _columns = _columns.map(column => {
    if(column.name == columnName) return column.set('display', false);
    else return column;
  });
};

const showColumn = (columnName) => {
  _columns = _columns.map(column => {
    if(column.name == columnName) return column.set('display', true);
    else return column;
  });
};


const ColumnStore = new ColumnStoreClass();
export default ColumnStore;


TableDispatcher.register((action) => {
  switch(action.actionType) {
    case ActionTypes.SHOW_COLUMN:
    {
      showColumn(action.columnName);
      ColumnStore.emitChange();
      break
    }
    case ActionTypes.HIDE_COLUMN:
    {
      hideColumn(action.columnName);
      ColumnStore.emitChange();
      break

    }
  }
});