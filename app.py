import streamlit as st
import json
import os
import pandas as pd
import time
from agent import run_agent

PAGE_TITLE = "Enterprise AI Support Agent"
DB_FILE = "database.json"

st.set_page_config(
    page_title=PAGE_TITLE,
    layout="wide",
    initial_sidebar_state="expanded"
)

def load_db():
    if not os.path.exists(DB_FILE):
        return {"refund": "Refunds are processed in 5-10 days."}
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_db(data):
    try:
        with open(DB_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return True
    except:
        return False

with st.sidebar:
    st.header("Knowledge Base Management")
    
    db_data = load_db()

    with st.expander("Add New Entry", expanded=True):
        with st.form("add_form"):
            new_key = st.text_input("Topic Keyword")
            new_value = st.text_area("Response Content")
            submitted = st.form_submit_button("Save Entry")
            
            if submitted:
                if new_key and new_value:
                    db_data[new_key.lower()] = new_value
                    save_db(db_data)
                    st.success("Entry added successfully.")
                    time.sleep(1)
                    st.rerun()
                else:
                    st.error("Both fields are required.")

    st.divider()
    st.subheader("Existing Data")
    
    df = pd.DataFrame(list(db_data.items()), columns=["Keyword", "Response"])
    st.dataframe(df, use_container_width=True, hide_index=True)

    delete_target = st.selectbox("Select Topic to Delete", [""] + list(db_data.keys()))
    if delete_target:
        if st.button("Delete Selected Topic"):
            del db_data[delete_target]
            save_db(db_data)
            st.success("Topic deleted.")
            time.sleep(1)
            st.rerun()

st.title(PAGE_TITLE)
st.markdown("Automated support system powered by Groq LPU and Llama-3.")

if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "System ready. Please submit your query."}]

for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

if prompt := st.chat_input("Enter support query..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    st.chat_message("user").write(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Processing request..."):
            response = run_agent(prompt)
            st.write(response)
            st.session_state.messages.append({"role": "assistant", "content": response})