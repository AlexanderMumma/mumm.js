/*
* Work in Progress
* Alexander Mumma
*/


// Any generic logic should go here if it's not specific to a control type
class Control extends HTMLElement {
	constructor() {
		super();

		this.value = '';
		this.text = '';
	}

}

var lookupTemplate = document.createElement('template');
lookupTemplate.innerHTML = `
	<style>
	:host { 
		
	}
	* {
		padding: 0 0 0 0;
		margin: 0 0 0 0;
		-webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
		-moz-box-sizing: border-box;    /* Firefox, other Gecko */
		box-sizing: border-box;         /* Opera/IE 8+ */
	}
	.lup_buttons {
		float: right;
		margin-top: -19px;
		height: 20px;
		
	}
	input {
		width: 100%;
	}
	.buttonIcon {
		width: 16px;
		height: 16px;
		margin-top: -5px;
		margin-left: -7px;
		background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='16' viewBox='0 0 16 16' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
	}
	.buttonBox {
		float: left;
		padding-right: 5px;
		padding-top: 2px;
		padding-left: 5px;
		
		height: 18px;
		position: relative;
		overflow: hidden;
		width: 20px;
		left: -1px;	
	}
	.lookupHeader {
		font: 12px "Segoe UI", Arial, sans-serif;
		font-weight: bold;
		color: black;

		padding: 1px;
		border-top: white 1px solid;
		border-bottom: white 1px solid;
	}
	.lookupRow {
		padding-left: 4px !important;
		font: 12px "Segoe UI", Arial, sans-serif;
		cursor: pointer;
		border-collapse: collapse;
		box-sizing: border-box;
		border: none;

		padding: 1px;
		border-top: white 1px solid;
		border-bottom: white 1px solid;
		color: #333;
	}
	.lookupRow td {
		padding-left: 4px !important;
	}
	.lookupRow:hover {
		padding: 1px;
		background-color: #dcdcdc;
		border-top: #a9a9a9 1px solid;
		border-bottom: #a9a9a9 1px solid;
	}
	.parent {
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
		border-spacing: 0;
	}
	.required {
		border-left: solid 4px #bf0027 !important;
		padding-left: 3px !important;
	}
	</style>
	<div class="parent">
		<div style="padding-right:0px">
			<input part="input" type="text" />
		</div>
		<div class="lup_buttons">
			<div part="buttonBox" class="buttonBox">
				<div part="buttonIcon" class="buttonIcon"></div>
			</div>
		</div>
	</div>
	<slot name="lookupTmp"></slot>
	<slot name="lookup"></slot>
`;

class Lookup extends Control {
	constructor() {
		super();

		this._ListWidth = null;
		this._ListHeight = '300px';
		this.RemoveElement = true;
		
		this.objectArray = '';
		this.Fields = 'Text';
		this.ValueField = '';
		this.FieldHeaders = '';
		this.LookupParameters = [];

		this.lookupElement = null;
		this.url = "";
		
		var shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(lookupTemplate.content.cloneNode(true));

		this._lookupListTemplate = this.shadowRoot.querySelector('slot[name=lookupTmp]');
		this._lookupListSlot = this.shadowRoot.querySelector('slot[name=lookup]');
		this.LookupInput = this.shadowRoot.querySelector('input');
		
		this.LookupInput.addEventListener('blur', (event) => {
			this.closeLookup();
		});

		this.LookupInput.addEventListener('keyup', (event) => {
			switch (event.code) {
				case 'Escape':
					this.closeLookup();
					this.setValueText(this.value, this.text);
					break;
				case 'Backspace':
				case 'Delete':
					this.setValueText('', '');
					break;
				default:
					break;
			}
		});

		this.setValue = this.setValue.bind(this);
		this.setValueText = this.setValueText.bind(this);
		this.buildLookupResults = this.buildLookupResults.bind(this);
		this.buildAndPositionResults = this.buildAndPositionResults.bind(this);

		var button = this.shadowRoot.querySelector('.buttonBox');
		button.addEventListener('click', e => {
			this.initLookup();
		});

	}

	attributeChangedCallback(name, oldValue, newValue) {
		const hasValue = newValue !== null; 
		var parent = this.shadowRoot.querySelector('.parent');
		switch (name) {
			case 'width':
				
				console.log('width');
				break;
		}
	}

	connectedCallback() {
		this._upgradeAttribute('width');
		this._upgradeAttribute('ListWidth');
		this._upgradeAttribute('ListHeight');
		this._upgradeAttribute('Required');
	}
	set width(value) {
		var parent = this.shadowRoot.querySelector('.parent');
		parent.style.width = value;
	}
	get width() {
		return this.getAttribute('width');
	}
	set ListWidth(value) {
		this._ListWidth = value;
	}
	get ListWidth() {
		return this._ListWidth;
	}
	get ListHeight() {
		return this._ListHeight;
	}
	set ListHeight(value) {
		this._ListHeight = value;
	}
	get Required() {
		return this.LookupInput.required;
	}
	set Required(value) {
		this.LookupInput.required = value;   
	}

	_upgradeAttribute(attribute) {
		if (this.hasAttribute(attribute)) {

			let value = this.getAttribute(attribute);
			if (attribute == 'Required') {
				value = true;
			}

			this[attribute] = value;
		}
	}
	
	disconnectedCallback() {
		// TODO Clean up any events
	}

	initLookup() {
		if (!this.lookupElement) {
			fetch(this.url, {
				method: 'get',
				headers: {
					"Content-type": "application/json"
				}
			})
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				// Work with JSON data here
				var lookupResults = this.buildLookupResults(data);
				this.buildAndPositionResults(lookupResults);

			})
			.catch(function (error) {
				console.log('Request failed', error);
			});
		} else {
			this.showLookup();
		}
		this.showLookup();
	}

	showLookup() {
		if (this.lookupElement) {
			this.repositionLookupResults();
			this.lookupElement.style.display = '';
			this.LookupInput.focus();
			this.LookupInput.setSelectionRange(0, 0);
		}
	}

	closeLookup() {
		if (this.lookupElement) {
			if (this.RemoveElement) {
				this.lookupElement.remove();
				this.lookupElement = null;
			} else {
				this.lookupElement.scrollTop = 0;
				this.lookupElement.style.display = 'none';
			}
		}
	}

	setValue(value) {
		this.value = value;
	}

	setValueText(value, text) {
		this.text = text;
		this.value = value;
		var input = this.shadowRoot.querySelector('input');
		input.value = text;

		this.closeLookup();
	}

	buildLookupResults(json) {
		var popSetValueText = this.setValueText;
		function generateClickHandler(value, lookupText) {
			return function (event) {
				popSetValueText(value, lookupText);
			};
		}

		// not a fan of this
		function isArray(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}

		var fields = this.Fields.split(',');
		var headers = this.FieldHeaders.split(',');

		var lookupCollection = null;
		if (isArray(json)) {
			lookupCollection = json;
		} else {
			// Need to look at the fields to see if we received dot notation?
			lookupCollection = json[this.objectArray];
		}

		var table = document.createElement('table');
		// push to configurable stypes
		table.style.width = '100%';
		table.style.border = 'none';
		table.style.borderCollapse = 'collapse';
		var body = document.createElement('tbody');

		var headrow = document.createElement('tr');
		headrow.className = 'lookupHeader';

		headers.forEach(function (header) {
			var th = document.createElement('td');
			th.innerText = header;
			headrow.appendChild(th);
		});

		body.appendChild(headrow);
		for (let i = 0; i < lookupCollection.length; i++) {
			var lookupItem = lookupCollection[i];
			var value = lookupItem[this.ValueField];
			var lookupText = lookupItem[this.TextField];

			var row = document.createElement('tr');
			row.className = 'lookupRow';
			row.tabindex = '-1';
			fields.forEach(function (field) {
				var td = document.createElement('td');
				td.innerText = lookupItem[field];
				row.appendChild(td);
			});

			// dealing with ordering of events so we're kind of ham-fisting some event logic here
			row.addEventListener('mousedown', function (event) { event.preventDefault(); });
			row.addEventListener('click', generateClickHandler(value, lookupText));
			body.appendChild(row);
		}
		table.appendChild(body);
		return table;
	}

	repositionLookupResults() {
		// doesn't like to transition between media queries - possibly move away from pixel positioning
		var position = this.getBoundingClientRect();
		this.lookupElement.top = (position.top + position.height) + 'px';
		this.lookupElement.left = position.left + 'px';
	}

	buildAndPositionResults(lookupResults) {
		var position = this.getBoundingClientRect();
		var div = document.createElement('div');
		this.lookupElement = div;

		// most of these styles should be moved away
		// except for things like the position style
		div.style.position = 'fixed';
		div.style.zIndex = 1;
		div.style.textAlign = 'left';
		div.style.overflowX = 'hidden';
		div.style.overflowY = 'auto';
		
		div.style.width = this.ListWidth ? this.ListWidth : position.width;
		div.style.height = this.ListHeight;
		div.style.backgroundColor = 'white';
		div.style.top = (position.top + position.height) + 'px';
		div.style.left = position.left + 'px';
		div.style.border = '1px solid #94B6ED';
		div.style.outline = '1px solid #A5C7FE';
		div.append(lookupResults);
		this._lookupListSlot.appendChild(div);
		this.showLookup();
	}
}

export { Lookup };