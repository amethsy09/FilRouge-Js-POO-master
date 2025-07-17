import { Modal } from './Modal.js';
export function confirm(msg){
  return new Promise(res=>{
    const body=document.createElement('div');
    body.innerHTML=`
      <p class="mb-4">${msg}</p>
      <div class="flex gap-4 justify-end">
        <button data-no class="px-4 py-2 rounded bg-gray-200">Annuler</button>
        <button data-yes class="px-4 py-2 rounded bg-red-600 text-white">OK</button>
      </div>`;
    const dlg=new Modal('Confirmation',body); dlg.open();
    body.querySelector('[data-no]').onclick =()=>{dlg.close();res(false);};
    body.querySelector('[data-yes]').onclick=()=>{dlg.close();res(true);};
  });
}
