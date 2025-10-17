import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TicketList from "@/components/TicketList";
import TicketForm from "@/components/TicketForm";
import TicketDetail from "@/components/TicketDetail";
import Login from "@/components/Login";
import auth from "@/lib/auth";
import { request } from "@/lib/api";

function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const u = auth.getUser();
      setUser(u);
      const unsub = auth.onAuthChange((next) => setUser(next));

      // try to load tickets from backend if we have a token
      try {
        if (u?.token) {
          const data = await request("/tickets", {
            method: "GET",
            token: u.token,
          });
          if (mounted) setTickets(data);
        } else {
          const savedTickets = localStorage.getItem("helpdesk_tickets");
          if (savedTickets) setTickets(JSON.parse(savedTickets));
        }
      } catch (err) {
        // fallback to localStorage
        const savedTickets = localStorage.getItem("helpdesk_tickets");
        if (savedTickets) setTickets(JSON.parse(savedTickets));
      }

      return unsub;
    }

    let unsubPromise;
    init().then((u) => (unsubPromise = u));

    return () => {
      mounted = false;
      if (unsubPromise) unsubPromise();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("helpdesk_tickets", JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (ticket) => {
    (async () => {
      const u = auth.getUser();
      try {
        if (u?.token) {
          const created = await request("/tickets", {
            method: "POST",
            body: ticket,
            token: u.token,
          });
          setTickets([created, ...tickets]);
        } else {
          const newTicket = {
            ...ticket,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "open",
            comments: [],
          };
          setTickets([newTicket, ...tickets]);
        }
      } catch (err) {
        // fallback local
        const newTicket = {
          ...ticket,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "open",
          comments: [],
        };
        setTickets([newTicket, ...tickets]);
      } finally {
        setShowForm(false);
      }
    })();
  };

  const updateTicket = (ticketId, updates) => {
    (async () => {
      const u = auth.getUser();
      try {
        if (u?.token) {
          const updated = await request(`/tickets/${ticketId}`, {
            method: "PUT",
            body: updates,
            token: u.token,
          });
          setTickets(tickets.map((t) => (t.id === ticketId ? updated : t)));
          if (selectedTicket?.id === ticketId) setSelectedTicket(updated);
        } else {
          setTickets(
            tickets.map((ticket) =>
              ticket.id === ticketId
                ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
                : ticket
            )
          );
          if (selectedTicket?.id === ticketId)
            setSelectedTicket({ ...selectedTicket, ...updates });
        }
      } catch (err) {
        // optimistic local update fallback
        setTickets(
          tickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
              : ticket
          )
        );
        if (selectedTicket?.id === ticketId)
          setSelectedTicket({ ...selectedTicket, ...updates });
      }
    })();
  };

  const deleteTicket = (ticketId) => {
    (async () => {
      const u = auth.getUser();
      try {
        if (u?.token) {
          await request(`/tickets/${ticketId}`, {
            method: "DELETE",
            token: u.token,
          });
          setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
        } else {
          setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
        }
      } catch (err) {
        // fallback: remove locally
        setTickets(tickets.filter((ticket) => ticket.id !== ticketId));
      } finally {
        if (selectedTicket?.id === ticketId) setSelectedTicket(null);
      }
    })();
  };

  const addComment = (ticketId, comment) => {
    (async () => {
      const u = auth.getUser();
      try {
        if (u?.token) {
          const created = await request(`/tickets/${ticketId}/comments`, {
            method: "POST",
            body: { text: comment },
            token: u.token,
          });
          setTickets(
            tickets.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    comments: [...(t.comments || []), created],
                    updatedAt: created.createdAt,
                  }
                : t
            )
          );
          if (selectedTicket?.id === ticketId)
            setSelectedTicket({
              ...selectedTicket,
              comments: [...(selectedTicket.comments || []), created],
            });
        } else {
          const newComment = {
            id: Date.now().toString(),
            text: comment,
            author: "Usuario",
            createdAt: new Date().toISOString(),
          };
          setTickets(
            tickets.map((t) =>
              t.id === ticketId
                ? {
                    ...t,
                    comments: [...(t.comments || []), newComment],
                    updatedAt: new Date().toISOString(),
                  }
                : t
            )
          );
          if (selectedTicket?.id === ticketId)
            setSelectedTicket({
              ...selectedTicket,
              comments: [...(selectedTicket.comments || []), newComment],
            });
        }
      } catch (err) {
        const newComment = {
          id: Date.now().toString(),
          text: comment,
          author: "Usuario",
          createdAt: new Date().toISOString(),
        };
        setTickets(
          tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  comments: [...(t.comments || []), newComment],
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
        if (selectedTicket?.id === ticketId)
          setSelectedTicket({
            ...selectedTicket,
            comments: [...(selectedTicket.comments || []), newComment],
          });
      }
    })();
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
        <Header user={user} onNewTicket={() => setShowForm(true)} />

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
      {!user && <Login onClose={() => {}} />}
    </>
  );
}

export default App;
