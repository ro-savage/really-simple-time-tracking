const startTimeBtn = document.getElementById('start-timer-button');
const timerCounterSpan = document.getElementById('timer-counter');
const notificationBtn = document.getElementById('send-notification');
const todayCell = document.getElementById('cell-today');
const weekCell = document.getElementById('cell-week');
const monthCell = document.getElementById('cell-month');
const entriesTableBody = document.getElementById('entries-table-body')
const entriesRowTemplate = entriesTableBody.children[0];

let start
let interval
let time = 0

const oneMin = 1000 * 60

let tracking = {
  entries: [
    // {start: new Date('2020-08-30').valueOf() - oneMin * 4 , stop: new Date('2020-08-30').valueOf() - oneMin * 2 },
    // {start: new Date('2020-08-28').valueOf() - oneMin * 4 , stop: new Date('2020-08-28').valueOf() - oneMin * 2 },
    // {start: new Date('2020-08-02').valueOf() - oneMin * 4 , stop: new Date('2020-08-02').valueOf() - oneMin * 2 },
    // {start: new Date('2020-07-28').valueOf() - oneMin * 4 , stop: new Date('2020-07-28').valueOf() - oneMin * 2 },
  ]
}

const lsTracking = localStorage.getItem('tracking');

if (lsTracking) { tracking = JSON.parse(lsTracking) }
updateTotalsTables(getTotals())

function saveToLocalStorage() {
  localStorage.setItem('tracking', JSON.stringify(tracking));
}

console.log("totals - main", tracking)
console.log("get Totals", getTotals())
saveToLocalStorage()


// const currentTimer = localStorage.getItem("currentTimer")

// if (chrome && chrome.storage) {
//   chrome.storage.sync.get("currentTimer",function(obj){
//     if (obj.currentTimer) {
//       console.log('currentTimer is ', obj);
//       start = obj.currentTimer
//       startTimeBtn.innerText = 'Stop'
//       interval = setInterval(counterInterval, 1000)
//       var now = new Date().getTime()
//       time = now - start

//       timerCounterSpan.innerText = getFormattedDuration(time)
//     }
//   })

//   // chrome.storage.sync.get("totals", function(obj) {
//   //   if(obj.totals) {
//   //     console.log(obj.totals)
//   //     totals = obj.totals
//   //     if (totals.today.date === moment().format('YYYY-MM-DD')) {
//   //       totals.today.total = 0
//   //     }

//   //     console.log(totals.week.date, moment().format('d'))
//   //     // if (totals.week.date !== today.format('YYYY-ww')) {
//   //     if (totals.week.date > moment().format('d')) {
//   //       totals.week.total = 0
//   //     }

//   //     if (totals.month.date !== moment().format('YYYY-MM')) {
//   //       totals.month.total = 0
//   //     }

//   //     updateTotalsTables()
//   //     console.log('totals currently is ', obj.totals);
//   //   }
//   // });
// }

startTimeBtn.onclick = function(e) {
  let text = e.target.innerText

  if (text === 'Start') {
    start = new Date().getTime();
    startTimeBtn.innerText = 'Stop'
    timerCounterSpan.innerText = `0h 0m 0s`
    interval = setInterval(counterInterval, 1000)
  } else {
    saveTotals(time)
    stop()
  }
};

function getTotals () {
  const beginningOftoday = moment().startOf('day').valueOf()
  const beginningOfThisWeek = moment().startOf('week').valueOf()
  const beginningOfThisMonth = moment().startOf('month').valueOf()

  const oldestDate = beginningOfThisMonth > beginningOfThisWeek ? beginningOfThisWeek : beginningOfThisMonth
  const mostRecentIneligibleEntry = tracking.entries.findIndex(({ start }) => moment(start).valueOf() > oldestDate)
  const eligibleEntries = tracking.entries.slice(0, mostRecentIneligibleEntry - 1)

  return eligibleEntries.reduce((memo, { start, stop }) => {
    const monthStart = moment(start).startOf('month').valueOf()
    const weekStart = moment(start).startOf('week').valueOf()
    const dayStart = moment(start).startOf('day').valueOf()

    if (monthStart === beginningOfThisMonth) {
      memo.thisMonth += stop - start
    }

    if (weekStart === beginningOfThisWeek) {
      memo.thisWeek += stop - start
    }

    if (dayStart === beginningOftoday) {
      memo.today += stop - start
    }

    return memo
  }, { today: 0, thisWeek: 0, thisMonth: 0 })
}

function stop() {
  clearInterval(interval)
  startTimeBtn.innerText = 'Start'

  console.log({ start: start, stop: new Date().getTime() })

  tracking.entries.unshift({ start: start, stop: new Date().getTime() })

  time = 0
  timerCounterSpan.innerText = ""

  console.log(getTotals(), tracking.entries)

  updateTotalsTables(getTotals())

  const innerHtml = tracking.entries.slice(0, 3).map(({ start, stop }) => {
    const date = moment(start).format('YYYY-MM-DD')

    const startTime = moment(start).format('HH:mm')
    const stopTime = moment(stop).format('HH:mm')
    const startInput = `<input type="time" id="diff-time" value="${startTime}" />`
    const stopInput = `<input type="time" id="diff-time" value="${stopTime}" />`

    return `<tr><td>${date}</td><td>${startInput}</td><td>${stopInput}</td></tr>`
  }).join('')
  entriesTableBody.innerHTML = innerHtml

  saveToLocalStorage()

  // if (chrome && chrome.storage) {
  //   chrome.storage.sync.set({'totals': totals }, function(value) {
  //     console.log('saved totals')
  //   });

  //   chrome.storage.sync.set({"currentTimer": 0}, function(value) {
  //     console.log('saved timer')
  //   })
  // }
}

function saveTotals(addTime, stop = new Date().getTime()) {
  // console.log("Add time", addTime)
  // totals.today.total += addTime
  // totals.today.date = moment().format('YYYY-MM-DD')
  // totals.week.total += addTime
  // totals.week.date = moment().format('d')
  // totals.month.total += addTime
  // totals.month.date = moment().format('YYYY-MM')
  // totals.all.total += addTime
  // totals.all.entries.push({start: start, stop: stop });
  // updateTotalsTables()

  // if (chrome && chrome.storage) {
  //   chrome.storage.sync.set({'totals': totals }, function(value) {
  //     console.log('saved totals')
  //   });

  //   chrome.storage.sync.set({"currentTimer": 0}, function(value) {
  //     console.log('saved timer')
  //   })
  // }
}

notificationBtn.onclick = function() {

  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }


  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(`Timer is running!!: ${getFormattedDuration(time)}`);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(`Timer is running: ${getFormattedDuration(time)}`);
      }
    });

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }

//   chrome.notifications.create({
//     type:     'basic',
//     iconUrl:  'images/get_started128.png',
//     title:    'Are you still working?',
//     message:  'Close -> Yes.\nMore -> No.',
//     requireInteraction: true,
//     buttons: [
//       {title: 'Finished Working'}
//     ],
//     priority: 0});

// }

// if (chrome && chrome.notifications) {
//   chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
//     console.log(notificationId, buttonIndex)

//     if (buttonIndex === 0) {
//       stop();
//     }
//   })
}

// function saveTotals() {
//   if (chrome && chrome.storage) {
//     chrome.storage.sync.set({"currentTimer": start}, function(value) {
//       console.log('saved timer')
//     })
//   }
// }

function counterInterval() {
  var now = new Date().getTime();
  time = now - start;

  timerCounterSpan.innerText = getFormattedDuration(time)

  // chrome.storage.sync.set({"currentTimer": start}, function(value) {
  //   console.log('saved timer')
  // })
}

function updateTotalsTables(totals) {
  todayCell.innerText = getFormattedDuration(totals.today, true)
  weekCell.innerText = getFormattedDuration(totals.thisWeek, true)
  monthCell.innerText = getFormattedDuration(totals.thisMonth, true)
}

function getFormattedDuration(time, includeSeconds = true) {
  const duration = moment.duration(time)
  const hours = duration.hours()
  const minutes = duration.minutes()
  const seconds = duration.seconds()

  return `${hours}h ${minutes}m ${includeSeconds ? seconds + 's' : ''}`
}