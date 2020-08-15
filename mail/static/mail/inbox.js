function compose_email(reply) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  document.querySelector('#content').innerHTML = "";
      // document.querySelector('#content').innerHTML === "";
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    Object.values(emails).forEach(email=>{

      let div = document.createElement('div');
      div.innerHTML = `<button id=b${email.id} data-emailid=email.id>
        <div class="row">
          <div class="col-3" id=sender>
            ${email.sender}
          </div>
          <div class="col-6" id=subject>
                ${email.subject}
          </div>
          <div class="col-3" id=timestamp>
            ${email.timestamp}
          </div>
          </button>`
      if(email.read === true){
        div.style.background = "red";
        console.log(email);
      }
      else {
        div.style.background = "blue";
        console.log(email);
      }
      document.querySelector('#content').append(div);
      document.querySelector(`#b${email.id}`).addEventListener('click', () => load_email(`${email.id}`, mailbox));
    });
    // Print emails
    console.log(emails[0]);

    // ... do something else with emails ...
});
}

function load_email(id, mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  document.querySelector('#content-e').innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    div = document.createElement('div')
    if (mailbox === 'sent') {
      div.innerHTML =
      `<div id=initial>
      <div>From: <span>${email.sender}</span></div>
      <div>To: <span>${email.recipients}</span></div>
      <div>Subject: <span>${email.subject}</span></div>
      <div>Timestamp: <span>${email.timestamp}</span></div>
      <button id="reply">Reply</button>
      </div>
      <div>${email.body}</div>`
    }
    else if (mailbox === 'inbox'){
      div.innerHTML =
      `<div id=initial>
      <div>From: <span>${email.sender}</span></div>
      <div>To: <span>${email.recipients}</span></div>
      <div>Subject: <span>${email.subject}</span></div>
      <div>Timestamp: <span>${email.timestamp}</span></div>
      <div><button id="reply">Reply</button></div>
      <div><button id="archive">Archive</button></div>
      </div>
      <div>${email.body}</div>`
    }
    else {
      div.innerHTML =
      `<div id=initial>
      <div>From: <span>${email.sender}</span></div>
      <div>To: <span>${email.recipients}</span></div>
      <div>Subject: <span>${email.subject}</span></div>
      <div>Timestamp: <span>${email.timestamp}</span></div>
      <div><button id="reply">Reply</button><button id="archive">Unarchive</button></div>
      </div>
      <div>${email.body}</div>`
    }
    document.querySelector('#content-e').append(div);
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
      read: true
      })
    })
    document.querySelector('#reply').addEventListener('click', () => {

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'block';

      let subject = String(email.subject);
      let body = `On ${email.timestamp} ${email.sender} wrote: \n\n`;
      body = body + email.body;
      if (!subject.substring(0, 3) === "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = body;
    });

    document.querySelector('#archive').addEventListener('click', () => {
      if(email.archived === true) {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
      }
      else {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
      }
      load_mailbox('inbox');
    });
  });


}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false));

  // By default, load the inbox
  load_mailbox('inbox');

  // send email
  document.querySelector('#compose-form').onsubmit = function() {
    const recipients =  document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      alert(result.message);
    });
    load_mailbox('sent');
  }

  //show content

});
