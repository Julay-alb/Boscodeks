import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TicketList from "@/components/TicketList";
import TicketForm from "@/components/TicketForm";
import TicketDetail from "@/components/TicketDetail";

function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    const savedTickets = localStorage.getItem("helpdesk_tickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("helpdesk_tickets", JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "open",
      comments: [],
    };
    setTickets([newTicket, ...tickets]);
    setShowForm(false);
  };

  const updateTicket = (ticketId, updates) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, ...updates });
    }
  };

  const deleteTicket = (ticketId) => {
    setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
  };

  const addComment = (ticketId, comment) => {
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: "Usuario",
      createdAt: new Date().toISOString(),
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              comments: [...(ticket.comments || []), newComment],
              updatedAt: new Date().toISOString(),
            }
          : ticket
      )
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), newComment],
      });
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch =
      filterStatus === "all" || ticket.status === filterStatus;
    const priorityMatch =
      filterPriority === "all" || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <>
      <Helmet>
        <title>Helpdesk - Sistema de Gestión de Tickets</title>
        <meta
          name="description"
          content="Sistema profesional de helpdesk para gestionar tickets de soporte de manera eficiente"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <Header onNewTicket={() => setShowForm(true)} />

        <main className="container mx-auto px-4 py-8">
          <Dashboard tickets={tickets} />

          <TicketList
            tickets={filteredTickets}
            onSelectTicket={setSelectedTicket}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />
        </main>

        {showForm && (
          <TicketForm onSubmit={addTicket} onClose={() => setShowForm(false)} />
        )}

        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={updateTicket}
            onDelete={deleteTicket}
            onAddComment={addComment}
          />
        )}

        <Toaster />
      </div>
    </>
  );
}

export default App;
