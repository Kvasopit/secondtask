new Vue({
    el: "#app",
    data: {
        columns: [
            [], // 1-й столбец (Новые)
            [], // 2-й столбец (В процессе)
            []  // 3-й столбец (Готово)
        ]
    },
    computed: {
        // Блокировка первого столбца, если во втором уже 5 карточек и есть карточка в первом с прогрессом >50%
        isColumn1Blocked() {
            const secondColFull = this.columns[1].length >= 5;
            const hasHalfDone = this.columns[0].some(card => card.completed > 50);
            return secondColFull && hasHalfDone;
        }
    },
    methods: {
        addCard() {
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            let newCard = {
                title: "Новая заметка",
                tasks: [],
                completed: 0,
                completedAt: null,
                isEditingTitle: false
            };

            if (this.columns[0].length < 3) {
                this.columns[0].push(newCard);
                console.log("Карточка добавлена:", newCard);
            } else {
                console.warn("Максимум 3 карточки в первой колонке!");
            }
        },

        addTask(card) {
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            if (card.tasks.length < 5) {
                let newTask = { text: "Новый пункт", done: false, isEditing: false };
                card.tasks.push(newTask);
                console.log("Добавлен пункт:", newTask, "в карточку", card.title);
            } else {
                console.warn("Максимум 5 пунктов в одной карточке!");
            }
        },

        updateProgress(card) {
            let completedTasks = card.tasks.filter(task => task.done).length;
            let totalTasks = card.tasks.length;
            card.completed = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            console.log(`Прогресс карточки "${card.title}": ${card.completed}%`);
            this.moveCard(card);
        },

        moveCard(card) {
            // Определяем, в каком столбце находится карточка
            let columnIndex = this.columns.findIndex(col => col.includes(card));

            // Если карточка в 1-м столбце:
            if (columnIndex === 0) {
                // Если 100% — переходим сразу в 3-й столбец
                if (card.completed === 100) {
                    const idx = this.columns[0].indexOf(card);
                    if (idx !== -1) {
                        this.columns[0].splice(idx, 1);
                    }
                    card.completedAt = new Date().toLocaleString();
                    this.columns[2].push(card);
                    console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
                }
                // Если >50% — переходим во 2-й столбец (если там <5 карточек)
                else if (card.completed > 50) {
                    if (this.columns[1].length < 5) {
                        const idx = this.columns[0].indexOf(card);
                        if (idx !== -1) {
                            this.columns[0].splice(idx, 1);
                        }
                        this.columns[1].push(card);
                        console.log(`Карточка "${card.title}" перемещена в "В процессе"`);
                    } else {
                        console.warn("Вторая колонка заполнена, перемещение невозможно!");
                    }
                }
            }

            // Если карточка во 2-м столбце и выполнена на 100% — переходим в 3-й столбец
            if (columnIndex === 1 && card.completed === 100) {
                const idx = this.columns[1].indexOf(card);
                if (idx !== -1) {
                    this.columns[1].splice(idx, 1);
                }
                card.completedAt = new Date().toLocaleString();
                this.columns[2].push(card);
                console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
            }
        },

        // Редактирование пункта задачи
        editTask(task) {
            this.$set(task, 'isEditing', true);
        },
        saveTask(task) {
            task.isEditing = false;
        },

        // Редактирование названия карточки
        editCardTitle(card) {
            this.$set(card, 'isEditingTitle', true);
        },
        saveCardTitle(card) {
            card.isEditingTitle = false;
        },
        clearStorage() {
            localStorage.clear();
            // Если нужно, можно сбросить состояние приложения:
            this.columns = [[], [], []];
            console.log("LocalStorage очищен");
        }
    },
    mounted() {
        const savedData = localStorage.getItem("notes");
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    },
    watch: {
        columns: {
            deep: true,
            handler() {
                localStorage.setItem("notes", JSON.stringify(this.columns));
            }
        }
    }
});
