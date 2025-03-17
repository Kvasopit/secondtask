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
        // Проверяем, заблокирован ли первый столбец
        // (Во втором столбце 5 карточек И есть хотя бы одна карточка в первом столбце с >50%)
        isColumn1Blocked() {
            const secondColFull = this.columns[1].length >= 5;
            const hasHalfDone = this.columns[0].some(card => card.completed > 50);
            return secondColFull && hasHalfDone;
        }
    },
    methods: {
        addCard() {
            // Не даём добавить новую карточку, если столбец заблокирован
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            // Создаём новую карточку
            let newCard = {
                title: "Новая заметка",
                tasks: [],     // Список задач пустой
                completed: 0,  // Процент выполнения
                completedAt: null // Дата завершения (для 3-го столбца)
            };

            // Ограничение: в первом столбце не более 3 карточек
            if (this.columns[0].length < 3) {
                this.columns[0].push(newCard);
                console.log("Карточка добавлена:", newCard);
            } else {
                console.warn("Максимум 3 карточки в первой колонке!");
            }
        },

        addTask(card) {
            // Не даём добавить задачу, если столбец заблокирован
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            // Ограничение: в карточке не более 5 задач
            if (card.tasks.length < 5) {
                let newTask = { text: "Новый пункт", done: false };
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
            // Определяем, в каком столбце сейчас карточка
            let columnIndex = this.columns.findIndex(col => col.includes(card));

            // Если карточка в 1-м столбце:
            if (columnIndex === 0) {
                // 1) При 100% - сразу в 3-й столбец
                if (card.completed === 100) {
                    this.columns[0] = this.columns[0].filter(c => c !== card);
                    card.completedAt = new Date().toLocaleString();
                    this.columns[2].push(card);
                    console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
                }
                // 2) При >50% - во 2-й столбец (если там < 5 карточек)
                else if (card.completed > 50) {
                    if (this.columns[1].length < 5) {
                        this.columns[0] = this.columns[0].filter(c => c !== card);
                        this.columns[1].push(card);
                        console.log(`Карточка "${card.title}" перемещена в "В процессе"`);
                    } else {
                        console.warn("Вторая колонка заполнена, перемещение невозможно!");
                    }
                }
            }

            // Если карточка во 2-м столбце и выполнена на 100% - переходим в 3-й
            if (columnIndex === 1 && card.completed === 100) {
                this.columns[1] = this.columns[1].filter(c => c !== card);
                card.completedAt = new Date().toLocaleString();
                this.columns[2].push(card);
                console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
            }
        }
    },

    // Сохраняем данные в LocalStorage
    mounted() {
        // При загрузке страницы пробуем подгрузить сохранённые данные
        const savedData = localStorage.getItem("notes");
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    },
    watch: {
        // Любое изменение массива columns (вложенных данных) сохраняем
        columns: {
            deep: true,
            handler() {
                localStorage.setItem("notes", JSON.stringify(this.columns));
            }
        }
    }
});
