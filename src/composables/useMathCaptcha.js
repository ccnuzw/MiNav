import { ref, computed } from 'vue'

/**
 * 数学验证码组合式函数
 * 生成简单的加减法验证码
 */
export function useMathCaptcha() {
    const num1 = ref(0)
    const num2 = ref(0)
    const operator = ref('+')
    const userAnswer = ref('')

    // 计算正确答案
    const correctAnswer = computed(() => {
        if (operator.value === '+') {
            return num1.value + num2.value
        } else {
            return num1.value - num2.value
        }
    })

    // 生成验证码问题
    const generateCaptcha = () => {
        // 生成1-20之间的随机数
        num1.value = Math.floor(Math.random() * 20) + 1
        num2.value = Math.floor(Math.random() * 20) + 1

        // 随机选择加法或减法
        operator.value = Math.random() > 0.5 ? '+' : '-'

        // 如果是减法，确保结果为正数
        if (operator.value === '-' && num1.value < num2.value) {
            [num1.value, num2.value] = [num2.value, num1.value]
        }

        // 清空用户答案
        userAnswer.value = ''
    }

    // 验证用户答案
    const validateAnswer = () => {
        const answer = parseInt(userAnswer.value)
        return !isNaN(answer) && answer === correctAnswer.value
    }

    // 获取验证码问题文本
    const captchaQuestion = computed(() => {
        return `${num1.value} ${operator.value} ${num2.value} = ?`
    })

    // 初始化时生成一个验证码
    generateCaptcha()

    return {
        num1,
        num2,
        operator,
        userAnswer,
        captchaQuestion,
        generateCaptcha,
        validateAnswer
    }
}
