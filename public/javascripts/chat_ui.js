function divEscapedContentElelment(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

// Process user input
function processUserInput(chatApp, socket) {
  var message = $('#send-message').val();
  var systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#message').append(divEscapedContentElelment(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElelment(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'))
  }

  $('#send-message').val('');
}

// Logic client-side
var socket = io.connect();
$(document).ready(function() {
  
  var chatApp = new Chat(socket);
  
  socket.on('nameResult', function(result) {
    var message;
    if(result.message) {
      message = 'You are now know as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', function (result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function (message) {
    var newElememt = $('<div></div>').text(message.text);
    $('#messages').append(newElememt);
  });

  socket.on('room', function (rooms) {
    $('#room-list').empty();

    for(var room in rooms) {
      room = room.subString(1, room.lenght);
      if (room != '') {
        $('#room-list').append(divEscapedContentElelment(room));
      }
    }

    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('$send-message').focus();
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);
  
  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
