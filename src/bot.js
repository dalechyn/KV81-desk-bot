var core = require("./core.js");
var modules_path = "../node_modules/";
require(modules_path + "dotenv").config();

var TelegramBot = require("node-telegram-bot-api"),
  telegram = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
  });

telegram.onText(/\/start/, message => {
  telegram.sendMessage(
    message.chat.id,
    core.start(message.from.id, message.from.first_name),
    {
      reply_markup: {
        keyboard: [["/getList", "/in", "/out"], ["/help"]],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    }
  );
});

telegram.onText(/\/help/, message => {
  telegram.sendMessage(message.chat.id, core.help(), {
    reply_markup: {
      keyboard: [["/getList", "/in", "/out"], ["/help"]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

telegram.onText(/\/whoIs/, message => {
  telegram.sendMessage(message.chat.id, core.whoIsNow(), {
    reply_markup: {
      keyboard: [["/getList", "/in", "/out"]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

telegram.onText(/\/in/, message => {
  telegram.sendMessage(message.chat.id, core.getInLine(message.from.id));
});

telegram.onText(/\/out/, message => {
  telegram.sendMessage(message.chat.id, core.popByUID(message.from.id));
});

telegram.onText(/\/getList/, message => {
  telegram.sendMessage(message.chat.id, core.getList(), {
    reply_markup: {
      keyboard: [["/getList", "/in", "/out"], ["/help"]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

telegram.onText(/\/rm/, message => {
  var result = core.popbyUIDAdmin(message.from.id);
  if (result.msg === void 0) {
    telegram.sendMessage(message.chat.id, result);
  } else {
    telegram.sendMessage(message.chat.id, result.msg, result.json);
  }
});

telegram.on("callback_query", callbackQuery => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;
  if (data == -1) {
    telegram.answerCallbackQuery(callbackQuery.id).then(() =>
      telegram.editMessageText("Действие отменено.", {
        chat_id: msg.chat.id,
        message_id: msg.message_id
      })
    );
  } else {
    core.popByUID(data);

    telegram.answerCallbackQuery(callbackQuery.id).then(() => {
      telegram.editMessageText("Пользователь успешно удалён из очереди", {
        chat_id: msg.chat.id,
        message_id: msg.message_id
      });
      telegram.sendMessage(
        core.whoIsNow(),
        "Сейчас твоя очередь выходить к доске! :)"
      );
    });
  }
});
