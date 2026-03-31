// ===============================
// Admin Command and Response
// ===============================
/** @type {AdminConfig} */
const _adminConfig = {
  commands: {
    timer: ["!timer"],
    clearList: ["!clearlist"],
    clearDone: ["!cleardone", "!clear done"],
    clearUser: ["!clearuser", "clear user"],
    clearOld: ["!clearold"], // New 9/11/2025 - tnp
  },
  responseTo: {
    EN: {
      timer: "Focus timer set to {message} minutes",
      timerPause: "Timer paused ⏸",
      timerContinue: "Timer resumed ▶️",
      timerNotRunning: "No timer is currently running",
      timerNotPaused: "Timer is not paused",
      clearList: "All tasks have been cleared",
      clearDone: "All done tasks have been cleared",
      clearUser: "All tasks for {message} have been cleared",
      clearOld: "Cleared {message} old tasks",
    },
    ES: {
      timer: "El temporizador se ha restablecido a {message} minutos",
      timerPause: "Temporizador pausado ⏸",
      timerContinue: "Temporizador reanudado ▶️",
      timerNotRunning: "No hay ningún temporizador en ejecución",
      timerNotPaused: "El temporizador no está pausado",
      clearList: "Todas las tareas han sido eliminadas",
      clearDone: "Todas las tareas completadas han sido eliminadas",
      clearUser: "Todas las tareas de {message} han sido eliminadas",
    },
    FR: {
      timer: "Minuteur réglé à {message} minutes",
      timerPause: "Minuteur en pause ⏸",
      timerContinue: "Minuteur repris ▶️",
      timerNotRunning: "Aucun minuteur n'est en cours",
      timerNotPaused: "Le minuteur n'est pas en pause",
      clearList: "Toutes les tâches ont été effacées",
      clearDone: "Toutes les tâches terminées ont été effacées",
      clearUser: "Toutes les tâches de {message} ont été effacées",
    },
    JP: {
      timer: "フォーカスタイマーが {message} 分に設定されました",
      timerPause: "タイマーが一時停止しました ⏸",
      timerContinue: "タイマーが再開しました ▶️",
      timerNotRunning: "現在タイマーは動いていません",
      timerNotPaused: "タイマーは一時停止していません",
      clearList: "すべてのタスクがクリアされました",
      clearDone: "完了したすべてのタスクがクリアされました",
      clearUser: "{message} のすべてのタスクがクリアされました",
    },
    UA: {
      timer: "Таймер фокусу встановлено на {message} хвилин",
      timerPause: "Таймер на паузі ⏸",
      timerContinue: "Таймер відновлено ▶️",
      timerNotRunning: "Таймер зараз не запущено",
      timerNotPaused: "Таймер не на паузі",
      clearList: "Усі завдання видалено",
      clearDone: "Усі виконані завдання видалено",
      clearUser: "Усі завдання {message} видалено",
    },
    DE: {
      timer: "Fokus-Timer auf {message} Minuten eingestellt",
      timerPause: "Timer pausiert ⏸",
      timerContinue: "Timer fortgesetzt ▶️",
      timerNotRunning: "Es läuft derzeit kein Timer",
      timerNotPaused: "Timer ist nicht pausiert",
      clearList: "Alle Aufgaben wurden gelöscht",
      clearDone: "Alle erledigten Aufgaben wurden gelöscht",
      clearUser: "Alle Aufgaben von {message} wurden gelöscht",
    },
    PT_BR: {
      timer: "Temporizador de foco definido para {message} minutos",
      timerPause: "Temporizador pausado ⏸",
      timerContinue: "Temporizador retomado ▶️",
      timerNotRunning: "Nenhum temporizador está em execução",
      timerNotPaused: "O temporizador não está pausado",
      clearList: "Todas as tarefas foram removidas",
      clearDone: "Todas as tarefas concluídas foram removidas",
      clearUser: "Todas as tarefas de {message} foram removidas",
    }
  },
};
