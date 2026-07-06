import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import './App.css'

type TransactionType = 'Expense' | 'Receipt'

type Person = {
  id: number
  name: string
  dateOfBirth: string
}

type Transaction = {
  id: number
  description: string
  amount: number
  type: TransactionType
  userId: number
}

type PersonForm = {
  name: string
  age: string
}

type TransactionForm = {
  description: string
  value: string
  type: TransactionType
  personId: string
}

type PersonTotals = {
  person: Person
  income: number
  expense: number
  balance: number
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5299/api'
const moneyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const initialPersonForm: PersonForm = {
  name: '',
  age: '',
}

const initialTransactionForm: TransactionForm = {
  description: '',
  value: '',
  type: 'Expense',
  personId: '',
}

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const birthdayAlreadyHappened =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())

  if (!birthdayAlreadyHappened) {
    age -= 1
  }

  return age
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar os dados.')
  }

  return response.json() as Promise<T>
}

function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [personForm, setPersonForm] = useState<PersonForm>(initialPersonForm)
  const [transactionForm, setTransactionForm] =
    useState<TransactionForm>(initialTransactionForm)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    try {
      const [loadedPeople, loadedTransactions] = await Promise.all([
        requestJson<Person[]>('/users'),
        requestJson<Transaction[]>('/transactions'),
      ])

      setPeople(loadedPeople)
      setTransactions(loadedTransactions)
      setMessage('')
    } catch {
      setMessage('Nao foi possivel carregar os dados do servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    Promise.all([
      requestJson<Person[]>('/users'),
      requestJson<Transaction[]>('/transactions'),
    ])
      .then(([loadedPeople, loadedTransactions]) => {
        if (!isMounted) {
          return
        }

        setPeople(loadedPeople)
        setTransactions(loadedTransactions)
        setMessage('')
      })
      .catch(() => {
        if (isMounted) {
          setMessage('Nao foi possivel carregar os dados do servidor.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedPerson = people.find(
    (person) => person.id === Number(transactionForm.personId),
  )

  const peopleTotals = useMemo<PersonTotals[]>(() => {
    // A consulta de totais soma receitas e despesas por pessoa e deriva o saldo
    // usando a regra solicitada: saldo = receita - despesa.
    return people.map((person) => {
      const personTransactions = transactions.filter(
        (transaction) => transaction.userId === person.id,
      )
      const income = personTransactions
        .filter((transaction) => transaction.type === 'Receipt')
        .reduce((total, transaction) => total + transaction.amount, 0)
      const expense = personTransactions
        .filter((transaction) => transaction.type === 'Expense')
        .reduce((total, transaction) => total + transaction.amount, 0)

      return {
        person,
        income,
        expense,
        balance: income - expense,
      }
    })
  }, [people, transactions])

  const generalTotals = useMemo(
    () =>
      peopleTotals.reduce(
        (totals, current) => ({
          income: totals.income + current.income,
          expense: totals.expense + current.expense,
          balance: totals.balance + current.balance,
        }),
        { income: 0, expense: 0, balance: 0 },
      ),
    [peopleTotals],
  )

  async function handlePersonSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = personForm.name.trim()
    const age = Number(personForm.age)

    if (!name || !Number.isInteger(age) || age < 0) {
      setMessage('Informe um nome e uma idade valida para cadastrar a pessoa.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age }),
      })

      if (!response.ok) {
        throw new Error()
      }

      setPersonForm(initialPersonForm)
      setMessage('Pessoa cadastrada com sucesso.')
      await loadData()
    } catch {
      setMessage('Nao foi possivel cadastrar a pessoa.')
    }
  }

  async function handleDeletePerson(personId: number) {
    try {
      // A remocao e feita pelo backend, que tambem apaga as transacoes da pessoa
      // para manter a integridade dos dados persistidos no SQLite.
      const response = await fetch(`${API_URL}/users/${personId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error()
      }

      if (transactionForm.personId === String(personId)) {
        setTransactionForm((currentForm) => ({ ...currentForm, personId: '' }))
      }

      setMessage('Pessoa e transacoes vinculadas foram removidas.')
      await loadData()
    } catch {
      setMessage('Nao foi possivel excluir a pessoa.')
    }
  }

  async function handleTransactionSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const description = transactionForm.description.trim()
    const amount = Number(transactionForm.value)
    const person = people.find((item) => item.id === Number(transactionForm.personId))

    if (!description || !Number.isFinite(amount) || amount <= 0 || !person) {
      setMessage('Informe descricao, valor positivo e uma pessoa cadastrada.')
      return
    }

    // Pessoas menores de 18 anos so podem receber transacoes de despesa.
    if (calculateAge(person.dateOfBirth) < 18 && transactionForm.type === 'Receipt') {
      setMessage('Menores de idade podem ter apenas despesas cadastradas.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount,
          transactionType: transactionForm.type,
          userId: person.id,
        }),
      })

      if (!response.ok) {
        throw new Error()
      }

      setTransactionForm((currentForm) => ({
        ...initialTransactionForm,
        personId: currentForm.personId,
      }))
      setMessage('Transacao cadastrada com sucesso.')
      await loadData()
    } catch {
      setMessage('Nao foi possivel cadastrar a transacao.')
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-copy">
          <p className="eyebrow">Livro-caixa domestico</p>
          <h1>Um painel claro para acompanhar o dinheiro da casa.</h1>
          <p className="header-description">
            Cadastre moradores, registre movimentacoes e veja o saldo familiar
            sem perder o contexto de quem gerou cada receita ou despesa.
          </p>
        </div>
        <div className="summary-strip" aria-label="Resumo geral">
          <span>
            <small>Entradas</small>
            {formatMoney(generalTotals.income)}
          </span>
          <span>
            <small>Saidas</small>
            {formatMoney(generalTotals.expense)}
          </span>
          <strong>
            <small>Saldo da casa</small>
            {formatMoney(generalTotals.balance)}
          </strong>
        </div>
      </header>

      {message && <p className="status-message">{message}</p>}
      {isLoading && <p className="status-message">Carregando dados...</p>}

      <section className="workspace-grid">
        <form className="panel" onSubmit={handlePersonSubmit}>
          <div className="panel-heading">
            <span className="section-tag">Moradores</span>
            <h2>Quem participa das contas</h2>
            <p>Crie, liste e remova pessoas vinculadas ao caixa residencial.</p>
          </div>

          <label>
            Nome
            <input
              value={personForm.name}
              onChange={(event) =>
                setPersonForm((currentForm) => ({
                  ...currentForm,
                  name: event.target.value,
                }))
              }
              placeholder="Ex.: Ana Souza"
            />
          </label>

          <label>
            Idade
            <input
              min="0"
              type="number"
              value={personForm.age}
              onChange={(event) =>
                setPersonForm((currentForm) => ({
                  ...currentForm,
                  age: event.target.value,
                }))
              }
              placeholder="Ex.: 32"
            />
          </label>

          <button type="submit">Cadastrar pessoa</button>
        </form>

        <form className="panel" onSubmit={handleTransactionSubmit}>
          <div className="panel-heading">
            <span className="section-tag">Movimento</span>
            <h2>Registro financeiro</h2>
            <p>Inclua receitas e despesas mantendo a pessoa responsavel.</p>
          </div>

          <label>
            Descricao
            <input
              value={transactionForm.description}
              onChange={(event) =>
                setTransactionForm((currentForm) => ({
                  ...currentForm,
                  description: event.target.value,
                }))
              }
              placeholder="Ex.: Supermercado"
            />
          </label>

          <div className="form-row">
            <label>
              Valor
              <input
                min="0.01"
                step="0.01"
                type="number"
                value={transactionForm.value}
                onChange={(event) =>
                  setTransactionForm((currentForm) => ({
                    ...currentForm,
                    value: event.target.value,
                  }))
                }
                placeholder="0,00"
              />
            </label>

            <label>
              Tipo
              <select
                value={transactionForm.type}
                onChange={(event) =>
                  setTransactionForm((currentForm) => ({
                    ...currentForm,
                    type: event.target.value as TransactionType,
                  }))
                }
              >
                <option value="Expense">Despesa</option>
                <option
                  value="Receipt"
                  disabled={
                    selectedPerson !== undefined &&
                    calculateAge(selectedPerson.dateOfBirth) < 18
                  }
                >
                  Receita
                </option>
              </select>
            </label>
          </div>

          <label>
            Pessoa
            <select
              value={transactionForm.personId}
              onChange={(event) =>
                setTransactionForm((currentForm) => {
                  const person = people.find(
                    (item) => item.id === Number(event.target.value),
                  )
                  const nextType =
                    person && calculateAge(person.dateOfBirth) < 18
                      ? 'Expense'
                      : currentForm.type

                  return {
                    ...currentForm,
                    personId: event.target.value,
                    type: nextType,
                  }
                })
              }
            >
              <option value="">Selecione uma pessoa</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} - {calculateAge(person.dateOfBirth)} anos
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={people.length === 0}>
            Cadastrar transacao
          </button>
        </form>
      </section>

      <section className="content-grid">
        <div className="panel list-panel">
          <div className="panel-heading">
            <span className="section-tag">Base</span>
            <h2>Pessoas cadastradas</h2>
            <p>{people.length} registro(s)</p>
          </div>

          {people.length === 0 ? (
            <p className="empty-state">Nenhuma pessoa cadastrada ainda.</p>
          ) : (
            <ul className="record-list">
              {people.map((person) => (
                <li key={person.id}>
                  <div>
                    <strong>{person.name}</strong>
                    <span>
                      {calculateAge(person.dateOfBirth)} anos | ID: {person.id}
                    </span>
                  </div>
                  <button type="button" onClick={() => handleDeletePerson(person.id)}>
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel list-panel">
          <div className="panel-heading">
            <span className="section-tag">Historico</span>
            <h2>Transacoes cadastradas</h2>
            <p>{transactions.length} registro(s)</p>
          </div>

          {transactions.length === 0 ? (
            <p className="empty-state">Nenhuma transacao cadastrada ainda.</p>
          ) : (
            <ul className="record-list">
              {transactions.map((transaction) => {
                const person = people.find((item) => item.id === transaction.userId)

                return (
                  <li key={transaction.id}>
                    <div>
                      <strong>{transaction.description}</strong>
                      <span>
                        {person?.name ?? 'Pessoa removida'} | ID: {transaction.id}
                      </span>
                    </div>
                    <span className={transaction.type === 'Receipt' ? 'income' : 'expense'}>
                      {transaction.type === 'Receipt' ? 'Receita' : 'Despesa'}{' '}
                      {formatMoney(transaction.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="panel totals-panel">
        <div className="panel-heading">
          <span className="section-tag">Fechamento</span>
          <h2>Consulta de totais</h2>
          <p>Total de receitas, despesas e saldo por pessoa.</p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {peopleTotals.map((item) => (
                <tr key={item.person.id}>
                  <td>
                    {item.person.name}
                    <small>{calculateAge(item.person.dateOfBirth)} anos</small>
                  </td>
                  <td>{formatMoney(item.income)}</td>
                  <td>{formatMoney(item.expense)}</td>
                  <td className={item.balance >= 0 ? 'income' : 'expense'}>
                    {formatMoney(item.balance)}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total geral</td>
                <td>{formatMoney(generalTotals.income)}</td>
                <td>{formatMoney(generalTotals.expense)}</td>
                <td className={generalTotals.balance >= 0 ? 'income' : 'expense'}>
                  {formatMoney(generalTotals.balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default App
