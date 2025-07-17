export class Modal {
  constructor(title, body){
    this._el=document.createElement('div');
    this._el.className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    this._el.innerHTML=`
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div class="px-4 py-2 border-b flex justify-between items-center">
          <h2 class="font-semibold">${title}</h2>
          <button data-close>&times;</button>
        </div>
        <div class="p-4"></div>
      </div>`;
    this._el.querySelector('.p-4').append(body);
    this._el.querySelector('[data-close]').onclick=()=>this.close();
  }
  open(){document.body.append(this._el);}
  close(){this._el.remove();}
}
