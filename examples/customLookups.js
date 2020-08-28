import { Lookup } from '../src/mumm.js'

class PlaceholderUser extends Lookup {
    constructor() {
        super();

        this.Fields = 'username,email';
        this.FieldHeaders = 'Username,Email';
        this.url = "https://jsonplaceholder.typicode.com/users";
        this.objectArray = '';
        this.RemoveElement = false;
        this.ValueField = 'id';
        this.TextField = 'name';
    }
}

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

customElements.define('ph-user', PlaceholderUser);
customElements.define('ph-todo', PlaceholderTodo);