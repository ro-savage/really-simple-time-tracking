const totals = {
  today: {
    date: '',
    total: 0,
    entries: []
  },
  week: {
    date: '',
    total: 0,
    entries: []
  },
  month: {
    date: '',
    total: 0,
    entries: []
  }
}

let showNotification


navigator.serviceWorker.ready.then(function(registration) {
  showNotification = registration.showNotification
})

chrome.runtime.onInstalled.addListener(function() {

  chrome.storage.sync.set({currentTimer: 0}, function(value) {
    console.log('currentTimer is set to ' + value);
  });

  chrome.storage.sync.set({totals: JSON.stringify(totals)}, function(value) {
    console.log('totals is set to ' + value);
  });
});

// if (window.Notification) {
//   setInterval(function() {
//     show();
//   }, 10000);
// }

function show() {

  chrome.notifications.create({
    type:     'basic',
    iconUrl:  'images/get_started128.png',
    title:    'Are you still working?',
    message:  'Close to confirm. More to end.',
    requireInteraction: true,
    buttons: [
      {title: 'Finished Working'}
    ],
    priority: 0});

  // new Notification("Are you still working?", {
  //   icon: 'images/get_started128.png',
  //   body: 'Worked X hour so far',
  // });
}


chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  console.log(notificationId, buttonIndex)

  if (buttonIndex === 0) {
    chrome.storage.sync.set({currentTimer: 0}, function(value) {
      console.log('currentTimer is set to ' + value);
    });
  }
})



// chrome.runtime.onMessage.addListener(data => {
//   if (data.type === 'notification') {
//     chrome.notifications.create('', data.options);
//   }
// });