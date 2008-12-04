# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20081027144642) do

  create_table "auto", :id => false, :force => true do |t|
    t.string  "modelo", :limit => nil
    t.integer "año"
  end

  create_table "enano_files", :force => true do |t|
    t.string   "path"
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
  end

  add_index "enano_files", ["name"], :name => "index_enano_files_on_name"
  add_index "enano_files", ["path"], :name => "index_enano_files_on_path", :unique => true

  create_table "page_types", :force => true do |t|
    t.string   "text",       :limit => 20
    t.string   "icon_cls",   :limit => 20, :default => "rails-page-blank"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "pages", :force => true do |t|
    t.integer  "parent_id"
    t.string   "title"
    t.integer  "lft"
    t.integer  "rgt"
    t.integer  "page_type_id",                    :null => false
    t.boolean  "publish",      :default => false
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "passwords", :force => true do |t|
    t.integer  "user_id"
    t.string   "reset_code"
    t.datetime "expiration_date"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "products", :force => true do |t|
    t.string   "title"
    t.string   "law_number"
    t.text     "lead"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

  create_table "usuarios", :force => true do |t|
    t.string   "nombres"
    t.date     "fecha"
    t.string   "apellido"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
