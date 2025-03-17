new Vue({
    el: "#app",
    data: {
        columns: [
            [], // 1-й столбец (Новые)
            [], // 2-й столбец (В процессе)
            []  // 3-й столбец (Готово)
        ]
    },
    methods: {
        addCard() {
            if (this.columns[0].length < 3) {
                let newCard = {
                    title: "Новая заметка",
                    tasks: [],
                    completed: 0
                };
                this.columns[0].push(newCard);
                console.log("Карточка добавлена:", newCard);
            }
        },
        addTask(card) {
            if (card.tasks.length < 5) {
                let newTask = { text: "Новый пункт", done: false };
                card.tasks.push(newTask);
                console.log("Добавлен пункт:", newTask, "в карточку", card.title);
            }
        }
    }
});
