document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 class="mb-4">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(element => {
        
        const div = document.createElement('div');

        if (element.read){
          div.classList = 'newDiv mb-4 border border-1 alert-dark';
        }else {
          div.classList = 'newDiv mb-4 border border-1';
        }
        

        (mailbox === 'sent' ? 
        div.innerHTML = `<span><strong>To:</strong> ${element.recipients}</span> <span><strong>Subject:</strong> ${element.subject}</span> <span>${element.timestamp}</span>` : 
        div.innerHTML = `<span><strong>${element.sender}</strong></span> <span><strong>Subject:</strong> ${element.subject}</span> <span>${element.timestamp}</span>` 
        )

        document.querySelector('#emails-view').appendChild(div);


        document.querySelector('#emails-view').appendChild(div).addEventListener('click', () => {
            if (element.read === false) {
              fetch(`/emails/${element.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  read: true
                })
              })
            }    

            let btnID = mailbox === 'inbox' ? 'archive' : 'unarchive';
            let btnValue = mailbox === 'inbox' ? 'Archive' : 'Unarchive';

            document.querySelector('#emails-view').innerHTML = (mailbox === 'sent' ?
            `<div class="detail">
                <h2 class="mb-3">${element.subject}</h2>
                <div class="text-muted">to: ${element.recipients}</div>
                <div class="mt-5">${element.body}</div>
                <br>
                <hr>
                <div class="text-muted">On ${element.timestamp}</div>
              </div>`
              :
              `<div class="detail">
                <h2 class="mb-3">${element.subject}</h2>
                <div><strong>${element.sender}</strong></div>
                <div class="text-muted">to: me</div>
                <div class="mt-5">${element.body}</div>
                <br>
                <hr>
                <div class="text-muted">On ${element.timestamp}</div>
                <div class="mt-4">
                  <button id="reply" class="btn btn-outline-primary">Reply</button>
                  <button id=${btnID} class="btn btn-warning">${btnValue}</button>
                </div>
              </div>`
            )

            
            document.querySelector('#archive') && document.querySelector('#archive').addEventListener('click', () => {
              fetch(`/emails/${element.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: true
                })
              })
              .then(() => load_mailbox("inbox"));
            });


            document.querySelector('#unarchive') && document.querySelector('#unarchive').addEventListener('click', () => {
              fetch(`/emails/${element.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  archived: false
                })
              })
              .then(() => load_mailbox("archive"));
            });


            document.querySelector('#reply') && document.querySelector('#reply').addEventListener('click', () => {
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';
              document.querySelector('#compose-recipients').value = `${element.sender}`;
              document.querySelector('#compose-subject').value = `Re: ${element.subject}`;
              document.querySelector('#compose-body').value = `${element.body}`;
            });

          });
        });
      }) 
    .catch(error => console.log("Error", error)) 
  }


function send_mail() {
  fetch('/emails', {
     method: 'POST',
     body: JSON.stringify({
       recipients: document.querySelector('#compose-recipients').value,
       subject: document.querySelector('#compose-subject').value,
       body: document.querySelector('#compose-body').value
     })
   })
   .then(response => response.json())
   .then(result => {
     if ("message" in result) {
      msg(result.message, 'alert-success');
      load_mailbox('sent');
     }else {
       msg(result.error, 'alert-danger')
      }
   })
   .catch(error => console.log("Error", error))

   return false;
 }


function msg(msg, cls) {
  const message = document.createElement('div');
  message.innerHTML = msg;
  message.classList = `mt-4 mb-4 col-6 alert ${cls}`;
  (cls === 'alert-danger' ? document.querySelector('#compose-view').before(message) : 
  document.querySelector('#emails-view').before(message));

  setTimeout(function () {
    message.style.display = 'none'}, 2000);
}





