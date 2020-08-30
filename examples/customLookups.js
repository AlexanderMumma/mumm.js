import { Lookup } from '../src/mumm.js'

class PlaceholderTodo extends Lookup {
    constructor() {
        super();

        this.Fields = 'title,completed';
        this.FieldHeaders = 'Title,Completed';
        this.url = "https://jsonplaceholder.typicode.com/todos";
        this.objectArray = '';
        this.RemoveElement = false;
        this.ValueField = 'id';
        this.TextField = 'title';
    }
}

class NoStyleTodo extends Lookup {
    constructor() {
        super();

        this.Fields = 'title,completed';
        this.FieldHeaders = 'Title,Completed';
        this.url = "https://jsonplaceholder.typicode.com/todos";
        this.objectArray = '';
        this.RemoveElement = false;
        this.ValueField = 'id';
        this.TextField = 'title';
    }
}

customElements.define('ph-todo', PlaceholderTodo);
customElements.define('no-style', NoStyleTodo);