const startTimeBtn = document.getElementById('start-timer-button');
const timerCounterSpan = document.getElementById('timer-counter');
const notificationBtn = document.getElementById('send-notification');
const diffBtn = document.getElementById('diff-end-button');
const diffTime = document.getElementById('diff-time');
const diffContainer = document.getElementById('diff-container');
const todayCell = document.getElementById('cell-today');
const weekCell = document.getElementById('cell-week');
const monthCell = document.getElementById('cell-month');
let start
let interval
let time = 0

let totals = {
  today: {
    date: moment().format('YYYY-MM-DD'),
    total: 0,
  },
  week: {
    date: moment().format('d'),
    total: 0,
  },
  month: {
    date: moment().format('YYYY-MM'),
    total: 0,
  },
  all: {
    total: 0,
    entries: []
  }
}

console.log("totals - main", totals)

if (chrome && chrome.storage) {
  chrome.storage.sync.get("currentTimer",function(obj){
    if (obj.currentTimer) {
      console.log('currentTimer is ', obj);
      start = obj.currentTimer
      startTimeBtn.innerText = 'Stop'
      interval = setInterval(counterInterval, 1000)
      var now = new Date().getTime()
      time = now - start

      timerCounterSpan.innerText = getFormattedDuration(time)
    }
  })

  chrome.storage.sync.get("totals", function(obj) {
    if(obj.totals) {
      console.log(obj.totals)
      totals = obj.totals
      if (totals.today.date === moment().format('YYYY-MM-DD')) {
        totals.today.total = 0
      }

      console.log(totals.week.date, moment().format('d'))
      // if (totals.week.date !== today.format('YYYY-ww')) {
      if (totals.week.date > moment().format('d')) {
        totals.week.total = 0
      }

      if (totals.month.date !== moment().format('YYYY-MM')) {
        totals.month.total = 0
      }

      updateTotalsTables()
      console.log('totals currently is ', obj.totals);
    }
  });
}

diffBtn.onclick = function(e) {
  let text = e.target.innerText
  console.log("Clicked diff", text, text === 'Diff')
  if (text === 'Diff') {
    e.target.innerText = 'Save'
    diffContainer.style.display = 'block'
  } else {
    // const values = diffTime.value.split(':')
    // console.log(diffTime.value)
    // const updatedStop = dayjs().hour(values[0]).minute(values[1])
    // const newTime = updatedStop - start;
    // if (newTime > 0) { saveTotals(newTime, updatedStop.valueOf()) }
    // stop()
    // e.target.innerText = 'Diff'
    // diffContainer.style.display = 'none'
  }
}

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

function stop() {
  clearInterval(interval)
  startTimeBtn.innerText = 'Start'
  // totals.today.total += time
  // totals.today.entries.push({start: start, stop: new Date().getTime() });
  // totals.week.total += time
  // totals.week.entries.push({start: start, stop: new Date().getTime() });
  // totals.month.total += time
  // totals.month.entries.push({start: start, stop: new Date().getTime() });
  // totals.all.total += time
  // totals.all.entries.push({start: start, stop: new Date().getTime() });
  // updateTotalsTables()
  time = 0
  timerCounterSpan.innerText = ""

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
  console.log("Add time", addTime)
  totals.today.total += addTime
  totals.today.date = moment().format('YYYY-MM-DD')
  totals.week.total += addTime
  totals.week.date = moment().format('d')
  totals.month.total += addTime
  totals.month.date = moment().format('YYYY-MM')
  totals.all.total += addTime
  totals.all.entries.push({start: start, stop: stop });
  updateTotalsTables()

  if (chrome && chrome.storage) {
    chrome.storage.sync.set({'totals': totals }, function(value) {
      console.log('saved totals')
    });

    chrome.storage.sync.set({"currentTimer": 0}, function(value) {
      console.log('saved timer')
    })
  }
}

notificationBtn.onclick = function() {

  chrome.notifications.create({
    type:     'basic',
    iconUrl:  'images/get_started128.png',
    title:    'Are you still working?',
    message:  'Close -> Yes.\nMore -> No.',
    requireInteraction: true,
    buttons: [
      {title: 'Finished Working'}
    ],
    priority: 0});

}

if (chrome && chrome.notifications) {
  chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    console.log(notificationId, buttonIndex)

    if (buttonIndex === 0) {
      stop();
    }
  })
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

  console.log("totals", totals)

  todayCell.innerText = getFormattedDuration(totals.today.total + time, true)
  weekCell.innerText = getFormattedDuration(totals.week.total + time, true)
  monthCell.innerText = getFormattedDuration(totals.month.total + time, true)

  chrome.storage.sync.set({"currentTimer": start}, function(value) {
    console.log('saved timer')
  })
}

function updateTotalsTables() {
  todayCell.innerText = getFormattedDuration(totals.today.total, true)
  weekCell.innerText = getFormattedDuration(totals.week.total, false)
  monthCell.innerText = getFormattedDuration(totals.month.total, false)
}

function getFormattedDuration(time, includeSeconds = true) {
  var hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((time % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${includeSeconds ? seconds + 's' : ''}`
}